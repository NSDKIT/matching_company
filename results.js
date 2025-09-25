// ===== 仮の企業データベース =====
const companyDB = [
    { id: 1, name: '株式会社ネクストキャリア', location: '首都圏', industry: 'IT・インターネット', recommendPoints: ['成長できる環境', '裁量の大きさ', 'チームワーク'], training: '資格取得費用全額補助、海外研修制度', culture: '若手が多く活気があり、失敗を恐れず挑戦する文化。' },
    { id: 2, name: 'Fukui Future Systems株式会社', location: '福井県内', industry: 'IT・インターネット', recommendPoints: ['ワークライフバランス', '安定した経営基盤', '福利厚生'], training: 'OJT制度が充実、メンター制度あり', culture: '地域密着で腰を据えて働ける。アットホームな雰囲気。' },
    { id: 3, name: 'グローカル製造株式会社', location: '福井県内', industry: 'メーカー（製造業）', recommendPoints: ['職場の雰囲気・人間関係', 'チームワーク', '福利厚生'], training: '熟練の技術者による技術継承研修', culture: 'チームでの目標達成を重視。社員同士のコミュニケーションが活発。' }
];

// ===== マルチLLMパイプラインシミュレーション =====

// ** Step 1: Geminiによる価値観の構造化（シミュレーション） **
function simulateGeminiAnalysis(profile) {
    // 自由記述からキーワードを抽出するフリをする
    const coreValues = new Set(profile.priorities);
    if (profile.motivationText.includes('挑戦')) coreValues.add('挑戦的な環境');
    if (profile.motivationText.includes('チーム') || profile.motivationText.includes('協力')) coreValues.add('チームワーク');
    if (profile.motivationText.includes('成長')) coreValues.add('成長実感');
    if (coreValues.size === 0) coreValues.add('安定志向');

    return {
        coreValues: Array.from(coreValues),
        hardConditions: {
            locations: profile.areas,
            industries: profile.industries
        }
    };
}

// ** Step 2: Claude 3による深層マッチングとスコアリング（シミュレーション） **
function simulateClaudeScoring(geminiOutput, db) {
    const topCompanies = [];

    db.forEach(company => {
        let score = 0;
        let analysis = [];

        // ハード条件でのフィルタリング
        if (!geminiOutput.hardConditions.locations.includes(company.location) || !geminiOutput.hardConditions.industries.includes(company.industry)) {
            return; // 候補から除外
        }

        // コアバリューとの一致度を評価
        geminiOutput.coreValues.forEach(value => {
            if (company.recommendPoints.includes(value)) {
                score += 10;
                analysis.push(`あなたの価値観「${value}」は、企業の強みと一致します。`);
            }
            if (company.culture.includes(value.slice(0, 2))) {
                score += 5;
            }
        });

        if (score > 0) {
            topCompanies.push({
                companyId: company.id,
                companyName: company.name,
                totalScore: score,
                analysis: analysis.join(' '),
                // GPT-4に渡すための企業情報も添付
                companyInfo: company
            });
        }
    });

    return { top3Companies: topCompanies.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3) };
}

// ** Step 3: GPT-4によるパーソナライズ推薦文の生成（シミュレーション） **
function simulateGpt4Copywriting(claudeOutput, profile) {
    return claudeOutput.top3Companies.map(companyData => {
        const { companyName, analysis, companyInfo } = companyData;
        let personalizedReason = `${companyName}がおすすめです！`;
        
        // 自由記述の内容を引用するフリ
        if(profile.motivationText.length > 10) {
            personalizedReason += `「${profile.motivationText.substring(0, 15)}...」というあなたの想いに、この企業は応えてくれます。`;
        }
        
        personalizedReason += `特に、${analysis} この環境なら、あなたのポテンシャルを最大限に発揮できるでしょう。`;

        return {
            ...companyInfo,
            matchReason: personalizedReason
        };
    });
}


// ===== ページ表示処理 =====

document.addEventListener('DOMContentLoaded', () => {
    const studentProfile = JSON.parse(sessionStorage.getItem('studentProfile'));
    if (!studentProfile) { window.location.href = 'index.html'; return; }

    // --- AIパイプラインを実行 ---
    const geminiResult = simulateGeminiAnalysis(studentProfile);
    const claudeResult = simulateClaudeScoring(geminiResult, companyDB);
    const finalRecommendations = simulateGpt4Copywriting(claudeResult, studentProfile);

    // --- 結果を表示 ---
    displayProfileSummary(geminiResult);
    displayRecommendations(finalRecommendations);
});

function displayProfileSummary(geminiResult) {
    const list = document.getElementById('profile-summary-list');
    list.innerHTML = geminiResult.coreValues.map(value => `<li>${value}</li>`).join('');
}

function displayRecommendations(companies) {
    const container = document.getElementById('recommendation-results');
    if (companies.length === 0) {
        container.innerHTML = '<p class="error-message">あなたにマッチする企業は見つかりませんでした。条件を変えて試してみてください。</p>';
        return;
    }

    companies.forEach(company => {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.innerHTML = `
            <h3>${company.name}</h3>
            <div class="match-points">
                <p>${company.matchReason}</p>
            </div>
            <div class="section-title">企業の特徴</div>
            <div class="details-grid">
                <div class="detail-item"><strong>強み:</strong><span>${company.recommendPoints.join(', ')}</span></div>
                <div class="detail-item"><strong>文化:</strong><span>${company.culture}</span></div>
                <div class="detail-item"><strong>研修制度:</strong><span>${company.training}</span></div>
            </div>
            <div class="action-links">
                <a href="#" class="youtube-link">雰囲気を動画で見る 🎬</a>
            </div>
        `;
        container.appendChild(card);
    });
}
