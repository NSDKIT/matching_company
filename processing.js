window.onload = () => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // Step 1: Gemini (1.5秒後に完了)
    setTimeout(() => {
        step1.classList.add('completed');
    }, 1500);

    // Step 2: Claude 3 (3.5秒後に完了)
    setTimeout(() => {
        step2.classList.add('completed');
    }, 3500);

    // Step 3: GPT-4 (5.5秒後に完了)
    setTimeout(() => {
        step3.classList.add('completed');
    }, 5500);

    // 全て完了後、結果ページへ遷移 (6秒後)
    setTimeout(() => {
        window.location.href = 'results.html';
    }, 6000);
};
