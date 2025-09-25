// ===== 仮の本格的な企業データベース =====
const companyDB = [
    { id: 1, name: '株式会社ネクストキャリア', location: '首都圏', industry: 'IT', recommendPoints: ['成長できる環境', '裁量の大きさ', 'チームワーク'], culture: '若手が多く活気があり、失敗を恐れず挑戦する文化。', realWork: { salary: '高め', wlb: '普通', atmosphere: '活発' }, internshipInfo: '挑戦的な課題解決型インターンを実施。' },
    { id: 2, name: 'Fukui Future Systems', location: '福井県内', industry: 'IT', recommendPoints: ['ワークライフバランス', '安定経営', '福利厚生'], culture: '地域密着で腰を据えて働けるアットホームな雰囲気。', realWork: { salary: '普通', wlb: '良い', atmosphere: '穏やか' }, selectionFlow: '面接では人柄を重視し、社員との座談会も設定。' },
    { id: 3, name: 'グローカル製造株式会社', location: '福井県内', industry: 'メーカー', recommendPoints: ['職場の雰囲気', 'チームワーク', '福利厚生'], culture: 'チームでの目標達成を重視。社員同士のコミュニケーションが活発。', realWork: { salary: '普通', wlb: '普通', atmosphere: '協調的' }, companyInfo: '正直な情報開示を心がけています。' }
];

// ===== マルチLLMパイプラインシミュレーション =====

// ** Step 1: Geminiによるペルソナと価値観の構造化（シミュレーション） **
function simulateGeminiAnalysis(profile) {
    let persona = `${profile.school}の${profile.grade}で、`;
    const coreValues = new Set(profile.priorities);

    // 自由記述から価値観を抽出
    const keywords = { '挑戦': '挑戦', '成長': '成長実感', 'チーム': 'チームワーク', '協力': 'チームワーク', 'アイデア': '創造性', '役に立つ': '社会貢献性', '安定': '安定志向' };
    const allText = profile.workStyleText + profile.motivationText;
    for (const key in keywords) { if (allText.includes(key)) coreValues.add(keywords[key]); }

    persona += `${Array.from(coreValues).slice(0, 2).join('と')}を重視し、`;
    persona += `${profile.industries.join('や')}業界に興味を持つ学生です。`;

    return {
        persona,
        coreValues: Array.from(coreValues),
        dealBreakers: profile.dealBreakers,
        hardConditions: { locations: profile.areas, industries: profile.industries, jobs: profile.jobs },
        requests: { info: profile.requiredContents, process: profile.requestsForCompany }
    };
}

// ** Step 2: Claude 3による深層マッチングとスコアリング（シミュレーション） **
function simulateClaudeScoring(geminiOutput, db) {
    return db.map(company => {
        let scores = { growth: 5, culture: 5, wlb: 5 };
        let analysis = [];

        // ハード条件フィルタリング
        if (!geminiOutput.hardConditions.locations.includes(company.location)) return null;
        if (!geminiOutput.hardConditions.industries.some(i => company.industry.includes(i))) return null;

        // コアバリューと企業文化のマッチング
        geminiOutput.coreValues.forEach(value => {
            if (company.recommendPoints.includes(value)) { scores.culture += 2; analysis.push(`価値観「${value}」が企業の強みと一致。`); }
            if (value === '成長できる環境') scores.growth += 3;
            if (value === 'ワークライフバランス') scores.wlb += 3;
        });

        // 嫌なポイントとの照合
        geminiOutput.dealBreakers.forEach(breaker => {
            if (breaker === 'ワークライフバランス' && company.realWork.wlb === '普通') scores.wlb -= 2;
            if (breaker === '職場の雰囲気' && company.realWork.atmosphere === '活発') scores.culture -= 1; // ミスマッチの可能性
        });
        
        // スコアを10点満点に正規化
        Object.keys(scores).forEach(key => scores[key] = Math.max(0, Math.min(10, scores[key])));

        return { company, scores, analysis, totalScore: scores.growth + scores.culture + scores.wlb };
    }).filter(Boolean).sort((a, b) => b.totalScore - a.totalScore);
}

// ** Step 3: GPT-4によるパーソナライズ推薦文の生成（シミュレーション） **
function simulateGpt4Copywriting(claudeResult, profile) {
    if (!claudeResult) return null;
    
    const { company, scores, analysis } = claudeResult;
    let reason = `**${company.name}**がおすすめです。<br>`;

    if (profile.motivationText) {
        reason += `あなたが働きがいに感じる「${profile.motivationText.substring(0, 20)}...」という想い。`;
        if (company.culture.includes('挑戦')) reason += 'この会社の挑戦を歓迎する文化は、あなたのその想いを実現する最高の舞台です。<br>';
        else if (company.culture.includes('チーム')) reason += 'この会社のチームワークを重んじる文化なら、そのやりがいを日々感じられるでしょう。<br>';
    }

    if (profile.requests.process.includes('正直')) {
         reason += `また、「大変な点も正直に話してほしい」というあなたの真摯な姿勢に、誠実な情報開示を心がけるこの企業は応えてくれるはずです。`;
    }

    return { company, scores, analysis, personalizedReason: reason };
}

// ===== ページ表示処理 =====
document.addEventListener('DOMContentLoaded', () => {
    const studentProfile = JSON.parse(sessionStorage.getItem('studentProfile'));
    if (!studentProfile) { window.location.href = 'index.html'; return; }

    // --- AIパイプラインを実行 ---
    const geminiResult = simulateGeminiAnalysis(studentProfile);
    const claudeResults = simulateClaudeScoring(geminiResult, companyDB);
    const finalRecommendations = claudeResults.map(result => simulateGpt4Copywriting(result, studentProfile));

    // --- 結果を表示 ---
    displayPersona(geminiResult);
    displayRecommendations(finalRecommendations);
});

function displayPersona(geminiResult) {
    document.getElementById('persona-summary').innerText = geminiResult.persona;
    document.getElementById('core-values-tags').innerHTML = geminiResult.coreValues.map(v => `<span>${v}</span>`).join('');
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendation-results');
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="error-message">マッチする企業が見つかりませんでした。</p>';
        return;
    }

    recommendations.forEach(rec => {
        const card = document.createElement('article');
        card.className = 'company-card';
        card.innerHTML = `
            <header>
                <h3>${rec.company.name}</h3>
                <div class="score-display">
                    <div>成長性: <span class="score-bar" style="width:${rec.scores.growth*10}%"></span> ${rec.scores.growth}/10</div>
                    <div>文化Fit: <span class="score-bar" style="width:${rec.scores.culture*10}%"></span> ${rec.scores.culture}/10</div>
                    <div>働きやすさ: <span class="score-bar" style="width:${rec.scores.wlb*10}%"></span> ${rec.scores.wlb}/10</div>
                </div>
            </header>
            <section class="match-points">
                <h4>あなたへの推薦理由 [by GPT-4]</h4>
                <p>${rec.personalizedReason}</p>
            </section>
            <section class="analysis-details">
                <h4>マッチング分析詳細 [by Claude 3]</h4>
                <ul>${rec.analysis.map(a => `<li>${a}</li>`).join('')}</ul>
            </section>
            <div class="action-links">
                <a href="#" class="primary-action">企業の詳細を見る</a>
            </div>
        `;
        container.appendChild(card);
    });
}
