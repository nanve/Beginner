// ==========================================
// ★ここにGASのウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxx/exec'; 
// ==========================================

// 要素の取得
const buttonGrid = document.querySelector('.button-grid');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const langJPButton = document.getElementById('lang-jp');
const langENButton = document.getElementById('lang-en');

// モーダル要素
const modal = document.getElementById('detail-modal');
const closeButton = document.querySelector('.close-button');

// 設定値
let allData = [];
const itemsPerPage = 15;
let currentPage = 1;
let currentLanguage = 'JP';

// スワイプ用変数
let touchStartX = 0;
let touchEndX = 0;

// --- 1. データ取得と初期化 ---
async function initApp() {
    try {
        const response = await fetch(GAS_API_URL);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        
        allData = data;
        renderButtons(); // ボタン描画
    } catch (error) {
        console.error('Error:', error);
        buttonGrid.innerHTML = '<p style="padding:20px; text-align:center;">データの読み込みに失敗しました。</p>';
    }
}

// --- 2. ボタン一覧の描画 ---
function renderButtons() {
    buttonGrid.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToDisplay = allData.slice(start, end);

    itemsToDisplay.forEach(item => {
        // 言語に応じたタイトル
        const title = currentLanguage === 'JP' ? item.Name_JP : item.Name_EN;
        const imageUrl = item.ImageUrl; 

        if (item.No) {
            const btn = document.createElement('div');
            btn.className = 'app-button';
            btn.innerHTML = `
                <img src="${imageUrl}" loading="lazy">
                <p>${title}</p>
            `;
            // クリックで詳細を開く
            btn.onclick = () => openModal(item);
            buttonGrid.appendChild(btn);
        }
    });

    updatePagination();
}

// --- 3. ページネーション制御 ---
function updatePagination() {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

prevButton.onclick = () => {
    if (currentPage > 1) { currentPage--; renderButtons(); window.scrollTo(0,0); }
};
nextButton.onclick = () => {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    if (currentPage < totalPages) { currentPage++; renderButtons(); window.scrollTo(0,0); }
};

// --- 4. 詳細モーダル表示 ---
function openModal(item) {
    const isJP = currentLanguage === 'JP';
    
    // 基本情報
    document.getElementById('modal-title').textContent = isJP ? item.Name_JP : item.Name_EN;
    document.getElementById('modal-image').src = item.ImageUrl;
    document.getElementById('modal-no').textContent = `No.${item.No}`;
    
    // 属性 (共通)
    document.getElementById('modal-element').textContent = item.Elements || '-';
    document.getElementById('modal-direction').textContent = item.Direction || '-';

    // 1. どんな方 (御真言)
    document.getElementById('modal-desc').textContent = isJP ? item.DeityDesc_JP : item.DeityDesc_EN;
    
    // 2. ささやき (General)
    document.getElementById('modal-b-general').textContent = isJP ? item.B_General_JP : item.B_General_EN;
    
    // 3. 仕事・恋愛・金運 (★新規追加部分)
    document.getElementById('modal-work').textContent = isJP ? item.B_Interp_Work_JP : item.B_Interp_Work_EN;
    document.getElementById('modal-love').textContent = isJP ? item.B_Interp_Love_JP : item.B_Interp_Love_EN;
    document.getElementById('modal-money').textContent = isJP ? item.B_Interp_Money_JP : item.B_Interp_Money_EN;

    // 4. 示唆の言葉 (CDN)
    document.getElementById('modal-b-cdn').textContent = isJP ? item.B_CDN_JP : item.B_CDN_EN;

    // 表示
    modal.classList.remove('hidden');
}

// モーダルを閉じる
closeButton.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

// --- 5. 言語切替 ---
function setLanguage(lang) {
    currentLanguage = lang;
    langJPButton.classList.toggle('active', lang === 'JP');
    langENButton.classList.toggle('active', lang === 'EN');
    renderButtons(); // 一覧再描画
}
langJPButton.onclick = () => setLanguage('JP');
langENButton.onclick = () => setLanguage('EN');

// --- 6. スワイプ操作 ---
document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const threshold = 50;
    if (touchEndX < touchStartX - threshold) nextButton.click(); // 左スワイプで次へ
    if (touchEndX > touchStartX + threshold) prevButton.click(); // 右スワイプで前へ
}

// アプリ開始
document.addEventListener('DOMContentLoaded', initApp);