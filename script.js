/**
 * ============================================================
 * script.js
 * JavaScript หลักของเว็บ "หนังสือต่างถิ่น"
 * ============================================================
 * 
 * โครงสร้างของไฟล์:
 * 1. State Management - จัดการสถานะของแอป
 * 2. DOM References - อ้างอิงถึง Element ในหน้าเว็บ
 * 3. Utility Functions - ฟังก์ชันช่วยเหลือทั่วไป
 * 4. Google Sheets API - ดึงข้อมูลจาก Google Sheets
 * 5. Render Functions - แสดงผลบนหน้าเว็บ
 * 6. Action Functions - ฟังก์ชันการทำงานต่างๆ
 * 7. Event Listeners - การจัดการเหตุการณ์
 * 8. Initialization - เริ่มต้นระบบ
 * ============================================================
 */

// ============================================================
// 1. STATE MANAGEMENT (จัดการสถานะของแอป)
// ============================================================

/**
 * state - เก็บสถานะทั้งหมดของแอปพลิเคชัน
 * @property {Array} books - ข้อมูลหนังสือทั้งหมด
 * @property {Array} filteredBooks - หนังสือที่ถูกกรองแล้ว
 * @property {Array} cart - รายการ book_id ในตะกร้า
 * @property {string} currentPage - หน้าปัจจุบัน (home, all-books, detail, cart, categories)
 * @property {string|null} currentBookId - รหัสหนังสือที่กำลังดู
 * @property {string} filterCategory - หมวดหมู่ที่เลือกกรอง ('all' = ทั้งหมด)
 * @property {string} filterLevel - ระดับที่เลือกกรอง ('all' = ทั้งหมด)
 * @property {string} searchQuery - คำค้นหา
 * @property {number} itemsPerPage - จำนวนหนังสือต่อหน้า
 * @property {number} currentPageIndex - หน้าปัจจุบัน (สำหรับการแบ่งหน้า)
 * @property {boolean} isLoading - สถานะกำลังโหลดข้อมูล
 */
const state = {
    books: [],
    filteredBooks: [],
    cart: [],
    currentPage: 'home',
    currentBookId: null,
    filterCategory: 'all',
    filterLevel: 'all',
    searchQuery: '',
    itemsPerPage: 10,
    currentPageIndex: 1,
    isLoading: false
};

// ============================================================
// 2. DOM REFERENCES (อ้างอิง Element ในหน้าเว็บ)
// ============================================================

/**
 * DOM - รวบรวม element ที่ใช้งานบ่อย
 * เพื่อให้โค้ดอ่านง่ายและจัดการได้สะดวก
 */
const DOM = {
    // ---- Header ----
    searchBar: document.getElementById('searchBar'),
    searchInput: document.getElementById('searchInput'),
    searchClose: document.getElementById('searchClose'),
    btnSearch: document.getElementById('btnSearch'),
    btnCart: document.getElementById('btnCart'),
    btnMenu: document.getElementById('btnMenu'),
    cartCount: document.getElementById('cartCount'),
    
    // ---- Side Menu ----
    sideMenu: document.getElementById('sideMenu'),
    menuClose: document.getElementById('menuClose'),
    overlay: document.getElementById('overlay'),
    menuFacebook: document.getElementById('menuFacebook'),
    
    // ---- Pages ----
    pages: {
        home: document.getElementById('page-home'),
        allBooks: document.getElementById('page-all-books'),
        categories: document.getElementById('page-categories'),
        detail: document.getElementById('page-detail'),
        cart: document.getElementById('page-cart')
    },
    
    // ---- Book Grids ----
    featuredBooks: document.getElementById('featuredBooks'),
    bestSellerBooks: document.getElementById('bestSellerBooks'),
    mostSearchedBooks: document.getElementById('mostSearchedBooks'),
    allBooksGrid: document.getElementById('allBooksGrid'),
    categoryGrid: document.getElementById('categoryGrid'),
    
    // ---- Filters ----
    categoryFilters: document.getElementById('categoryFilters'),
    levelFilters: document.getElementById('levelFilters'),
    
    // ---- Detail ----
    detailContainer: document.getElementById('bookDetailContainer'),
    detailBack: document.getElementById('detailBack'),
    
    // ---- Cart ----
    cartContainer: document.getElementById('cartContainer'),
    
    // ---- Other ----
    totalBooksCount: document.getElementById('totalBooksCount'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    toastIcon: document.getElementById('toastIcon'),
    currentYear: document.getElementById('currentYear'),
    
    // ---- Footer ----
    footerFacebook: document.getElementById('footerFacebook'),
    footerLine: document.getElementById('footerLine'),
    footerYoutube: document.getElementById('footerYoutube')
};

// ============================================================
// 3. UTILITY FUNCTIONS (ฟังก์ชันช่วยเหลือ)
// ============================================================

/**
 * แสดง Toast Notification (แจ้งเตือนแบบป๊อปอัป)
 * 
 * @param {string} message - ข้อความที่ต้องการแสดง
 * @param {string} type - ประเภท: 'success', 'error', 'info'
 * 
 * @example
 * showToast('คัดลอกเรียบร้อย!', 'success');
 * showToast('เกิดข้อผิดพลาด', 'error');
 */
function showToast(message, type = 'success') {
    DOM.toastMessage.textContent = message;
    DOM.toastIcon.className = 'fas';
    
    // กำหนดไอคอนและสีตามประเภท
    const styles = {
        success: { icon: 'fa-check-circle', color: '#27AE60' },
        error: { icon: 'fa-exclamation-circle', color: '#E74C3C' },
        info: { icon: 'fa-info-circle', color: '#3498DB' }
    };
    
    const style = styles[type] || styles.success;
    DOM.toastIcon.classList.add(style.icon);
    DOM.toast.style.background = style.color;
    
    // แสดง Toast
    DOM.toast.classList.add('show');
    
    // ซ่อนอัตโนมัติหลังจาก 2.5 วินาที
    clearTimeout(DOM.toast._timeout);
    DOM.toast._timeout = setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 2500);
}

/**
 * จัดรูปแบบตัวเลขให้มี comma คั่นหลัก
 * 
 * @param {number} num - ตัวเลขที่ต้องการจัดรูปแบบ
 * @returns {string} ตัวเลขที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
function formatNumber(num) {
    return new Intl.NumberFormat('th-TH').format(num);
}

/**
 * แปลงระดับความยากเป็น CSS Class
 * 
 * @param {string} level - ระดับความยาก (เริ่มต้น, ปานกลาง, สูง)
 * @returns {string} ชื่อคลาส CSS ที่สอดคล้อง
 * 
 * @example
 * getLevelClass('เริ่มต้น') // "beginner"
 */
function getLevelClass(level) {
    const map = {
        'เริ่มต้น': 'beginner',
        'ปานกลาง': 'intermediate',
        'สูง': 'advanced'
    };
    return map[level] || '';
}

/**
 * ดึง Emoji ตามหมวดหมู่ของหนังสือ
 * 
 * @param {string} category - ชื่อหมวดหมู่
 * @returns {string} Emoji ที่สอดคล้อง
 * 
 * @example
 * getCategoryEmoji('ฟิกฮ์') // "⚖️"
 */
function getCategoryEmoji(category) {
    const map = {
        'อะกีดะฮ์': '🕌',
        'ฟิกฮ์': '⚖️',
        'หะดีษ': '📜',
        'ตัฟซีร': '📖',
        'ภาษา': '📝',
        'ซีเราะฮ์': '📯',
        'อื่นๆ': '📚'
    };
    return map[category] || '📚';
}

/**
 * ดึงค่าระดับความยากเป็นสี
 * 
 * @param {string} level - ระดับความยาก
 * @returns {string} รหัสสี HEX
 */
function getLevelColor(level) {
    const map = {
        'เริ่มต้น': '#27AE60',  // เขียว
        'ปานกลาง': '#F39C12',  // ส้ม
        'สูง': '#E74C3C'       // แดง
    };
    return map[level] || '#8B6B4A';
}

/**
 * แปลงค่า is_featured จาก Google Sheets (TRUE/FALSE) เป็น Boolean
 * 
 * @param {string|boolean} value - ค่า is_featured
 * @returns {boolean} ค่า Boolean
 */
function parseFeatured(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toUpperCase() === 'TRUE' || value === '1';
    }
    return false;
}

// ============================================================
// 4. GOOGLE SHEETS API (ดึงข้อมูลจาก Google Sheets)
// ============================================================

/**
 * ดึงข้อมูลหนังสือจาก Google Sheets
 * 
 * วิธีการทำงาน:
 * 1. ส่ง Request ไปที่ Google Sheets API (gviz)
 * 2. รับข้อมูลในรูปแบบ JSONP
 * 3. แปลงข้อมูลให้เป็น Array ของ Objects
 * 4. ถ้าเกิดข้อผิดพลาด ใช้ข้อมูลสำรอง (SAMPLE_BOOKS)
 * 
 * @returns {Promise<Array>} รายการหนังสือทั้งหมด
 * 
 * @example
 * const books = await fetchBooks();
 * console.log(books.length); // 7
 */
async function fetchBooks() {
    try {
        console.log('📊 กำลังดึงข้อมูลจาก Google Sheets...');
        
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Google Sheets gviz API ส่งข้อมูลในรูปแบบ:
        // /*O_o*/google.visualization.Query.setResponse({...})
        // เราต้องตัดส่วนที่ไม่ใช่ JSON ออก
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonString = text.substring(jsonStart, jsonEnd);
        
        const jsonData = JSON.parse(jsonString);
        
        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (!jsonData.table || !jsonData.table.rows) {
            throw new Error('ไม่พบข้อมูลใน Google Sheets');
        }
        
        const rows = jsonData.table.rows;
        const headers = jsonData.table.cols.map(col => col.label);
        
        // แปลงข้อมูลเป็น Array ของ Objects
        const books = rows.map(row => {
            const book = {};
            row.c.forEach((cell, index) => {
                const key = headers[index];
                const value = cell ? cell.v : '';
                book[key] = value;
            });
            return book;
        });
        
        console.log(`✅ ดึงข้อมูลสำเร็จ: ${books.length} เล่ม`);
        return books;
        
    } catch (error) {
        console.error('❌ Error fetching from Google Sheets:', error);
        console.warn('⚠️ ใช้ข้อมูลสำรอง (SAMPLE_BOOKS) แทน');
        showToast('ไม่สามารถเชื่อมต่อ Google Sheets ใช้ข้อมูลสำรอง', 'error');
        return SAMPLE_BOOKS;
    }
}

// ============================================================
// 5. RENDER FUNCTIONS (แสดงผลบนหน้าเว็บ)
// ============================================================

/**
 * สร้าง HTML ของ Book Card (การ์ดหนังสือ)
 * 
 * @param {Object} book - ข้อมูลหนังสือ
 * @param {string} book.book_id - รหัสหนังสือ
 * @param {string} book.title - ชื่อหนังสือ
 * @param {string} book.author - ผู้แต่ง
 * @param {string} book.category - หมวดหมู่
 * @param {string} book.level - ระดับความยาก
 * @param {number} book.price - ราคา
 * @param {string} book.cover_image - URL รูปปก (ถ้ามี)
 * @returns {string} HTML ของการ์ดหนังสือ
 * 
 * @example
 * const html = createBookCard(book);
 * container.innerHTML = html;
 */
function createBookCard(book) {
    const levelClass = getLevelClass(book.level);
    const levelColor = getLevelColor(book.level);
    const emoji = getCategoryEmoji(book.category);
    const priceText = book.price > 0 ? `${formatNumber(book.price)} บาท` : 'ฟรี';
    
    return `
        <div class="book-card" data-book-id="${book.book_id}" onclick="viewBook('${book.book_id}')">
            <div class="cover" style="background: linear-gradient(135deg, #E8DDD0, #D4C5A9);">
                ${book.cover_image ? 
                    `<img src="${book.cover_image}" alt="${book.title}" loading="lazy">` : 
                    `<span style="font-size: 3rem;">${emoji}</span>`
                }
                <span class="level-badge ${levelClass}" style="background: ${levelColor};">
                    ${book.level}
                </span>
            </div>
            <div class="info">
                <div class="title">${book.title}</div>
                <div class="author">${book.author}</div>
                <div class="price">${priceText}</div>
                <span class="category-tag">${book.category}</span>
            </div>
        </div>
    `;
}

/**
 * แสดงหนังสือใน Grid
 * 
 * @param {HTMLElement} gridElement - Element ที่ใช้แสดง Grid
 * @param {Array} books - รายการหนังสือ
 * @param {number} limit - จำนวนสูงสุดที่จะแสดง (0 = แสดงทั้งหมด)
 */
function renderBooks(gridElement, books, limit = 0) {
    const displayBooks = limit > 0 ? books.slice(0, limit) : books;
    
    if (displayBooks.length === 0) {
        gridElement.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-light);">
                <i class="fas fa-book" style="font-size: 2.5rem; display: block; margin-bottom: 12px; opacity: 0.5;"></i>
                <p style="font-size: 1rem;">ไม่พบหนังสือที่ค้นหา</p>
                <p style="font-size: 0.85rem; opacity: 0.7;">ลองเปลี่ยนคำค้นหรือตัวกรองดูนะคะ</p>
            </div>
        `;
        return;
    }
    
    gridElement.innerHTML = displayBooks.map(book => createBookCard(book)).join('');
}

/**
 * แสดงหน้า Home (หน้าแรก)
 * 
 * @param {Array} books - รายการหนังสือทั้งหมด
 */
function renderHome(books) {
    // ---- หนังสือแนะนำ 5 เล่ม ----
    // ใช้ is_featured เป็นหลัก ถ้าไม่มีให้ใช้ 5 เล่มแรก
    const featured = books.filter(b => parseFeatured(b.is_featured)).slice(0, 5);
    renderBooks(DOM.featuredBooks, featured.length > 0 ? featured : books.slice(0, 5));
    
    // ---- หนังสือขายดี 5 เล่ม ----
    const bestSellers = [...books]
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 5);
    renderBooks(DOM.bestSellerBooks, bestSellers);
    
    // ---- หนังสือค้นหามากที่สุด 5 เล่ม ----
    const mostSearched = [...books]
        .sort((a, b) => (b.search_count || 0) - (a.search_count || 0))
        .slice(0, 5);
    renderBooks(DOM.mostSearchedBooks, mostSearched);
}

/**
 * แสดงหน้า All Books (หนังสือทั้งหมด) พร้อมระบบกรอง
 */
function renderAllBooks() {
    let filtered = [...state.books];
    
    // ---- กรองตามหมวดหมู่ ----
    if (state.filterCategory !== 'all') {
        filtered = filtered.filter(b => b.category === state.filterCategory);
    }
    
    // ---- กรองตามระดับ ----
    if (state.filterLevel !== 'all') {
        filtered = filtered.filter(b => b.level === state.filterLevel);
    }
    
    // ---- กรองตามคำค้นหา ----
    if (state.searchQuery.trim()) {
        const query = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(b => 
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            b.category.toLowerCase().includes(query)
        );
    }
    
    // บันทึกผลลัพธ์ที่กรองไว้
    state.filteredBooks = filtered;
    DOM.totalBooksCount.textContent = filtered.length;
    
    // ---- แบ่งหน้า (Pagination) ----
    const start = 0;
    const end = state.itemsPerPage * state.currentPageIndex;
    const displayBooks = filtered.slice(start, end);
    
    renderBooks(DOM.allBooksGrid, displayBooks);
    
    // แสดง/ซ่อนปุ่ม "โหลดเพิ่ม"
    DOM.loadMoreBtn.style.display = end < filtered.length ? 'inline-flex' : 'none';
}

/**
 * แสดงหน้า Categories (หมวดหมู่)
 * 
 * @param {Array} books - รายการหนังสือทั้งหมด
 */
function renderCategories(books) {
    // นับจำนวนหนังสือในแต่ละหมวดหมู่และแต่ละระดับ
    const categories = {};
    books.forEach(book => {
        const cat = book.category || 'อื่นๆ';
        if (!categories[cat]) {
            categories[cat] = { total: 0, levels: {} };
        }
        categories[cat].total++;
        
        const level = book.level || 'ไม่ระบุ';
        if (!categories[cat].levels[level]) {
            categories[cat].levels[level] = 0;
        }
        categories[cat].levels[level]++;
    });
    
    // Emoji สำหรับแต่ละหมวดหมู่
    const emojiMap = {
        'อะกีดะฮ์': '🕌',
        'ฟิกฮ์': '⚖️',
        'หะดีษ': '📜',
        'ตัฟซีร': '📖',
        'ภาษา': '📝',
        'ซีเราะฮ์': '📯',
        'อื่นๆ': '📚'
    };
    
    // สร้าง HTML
    DOM.categoryGrid.innerHTML = Object.entries(categories).map(([category, data]) => {
        const levelText = Object.entries(data.levels)
            .map(([level, count]) => `${level} (${count})`)
            .join(' • ');
        
        return `
            <div class="category-card" onclick="filterByCategory('${category}')">
                <div class="icon">${emojiMap[category] || '📚'}</div>
                <h4>${category}</h4>
                <div class="level-count">${data.total} เล่ม • ${levelText}</div>
            </div>
        `;
    }).join('');
}

/**
 * แสดงรายละเอียดหนังสือ
 * 
 * @param {Object} book - ข้อมูลหนังสือ
 */
function renderBookDetail(book) {
    if (!book) {
        DOM.detailContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 12px;"></i>
                <p>ไม่พบข้อมูลหนังสือ</p>
            </div>
        `;
        return;
    }
    
    const levelClass = getLevelClass(book.level);
    const levelColor = getLevelColor(book.level);
    const emoji = getCategoryEmoji(book.category);
    const priceText = book.price > 0 ? `${formatNumber(book.price)} บาท` : 'ฟรี';
    
    DOM.detailContainer.innerHTML = `
        <div class="detail-card">
            <!-- รูปปก -->
            <div class="detail-cover" style="display: flex; align-items: center; justify-content: center; font-size: 4rem; background: linear-gradient(135deg, #E8DDD0, #D4C5A9); min-height: 200px;">
                ${book.cover_image ? 
                    `<img src="${book.cover_image}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: contain; max-height: 400px;">` : 
                    emoji
                }
            </div>
            
            <!-- เนื้อหารายละเอียด -->
            <div class="detail-body">
                <h2>${book.title}</h2>
                <div class="author">✍️ ${book.author}</div>
                
                <div class="meta">
                    <span>📂 ${book.category}</span>
                    <span class="level-badge ${levelClass}" style="background: ${levelColor}; color: white; padding: 2px 14px; border-radius: 12px; font-size: 0.75rem;">
                        ${book.level}
                    </span>
                </div>
                
                <div class="price">${priceText}</div>
                
                <!-- คำอธิบาย -->
                <div class="section-title">📖 คำอธิบาย</div>
                <div class="description">${book.description || 'ไม่มีคำอธิบาย'}</div>
                
                <!-- สารบัญ -->
                ${book.table_of_contents ? `
                    <div class="section-title">📑 สารบัญ</div>
                    <div class="toc">${book.table_of_contents.replace(/\n/g, '<br>')}</div>
                ` : ''}
                
                <!-- รหัสหนังสือ -->
                <div class="section-title">🔖 รหัสหนังสือ</div>
                <div class="book-code-section">
                    <span class="code">${book.book_code || book.book_id}</span>
                    <button class="copy-btn" onclick="copyBookCode('${book.book_code || book.book_id}')">
                        <i class="fas fa-copy"></i> คัดลอก
                    </button>
                </div>
                
                <!-- ปุ่มดำเนินการ -->
                <div class="action-buttons">
                    <button class="btn-secondary" onclick="addToCart('${book.book_id}')">
                        <i class="fas fa-shopping-cart"></i> เพิ่มในตะกร้า
                    </button>
                    <a href="${book.facebook_link || 'https://m.me/ชื่อเพจ'}" target="_blank" class="btn-facebook">
                        <i class="fab fa-facebook-messenger"></i> สอบถามผ่านเพจ
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * แสดงหน้า Cart (ตะกร้าหนังสือ)
 */
function renderCart() {
    if (state.cart.length === 0) {
        DOM.cartContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <h3>ตะกร้าว่างเปล่า</h3>
                <p>ยังไม่มีหนังสือในตะกร้า ลองเลือกหนังสือที่สนใจดูนะคะ</p>
                <button class="btn-primary" onclick="navigateTo('all-books')" style="margin-top: 16px;">
                    ดูหนังสือทั้งหมด
                </button>
            </div>
        `;
        return;
    }
    
    // ดึงข้อมูลหนังสือจากตะกร้า
    const cartBooks = state.cart
        .map(id => state.books.find(b => b.book_id === id))
        .filter(Boolean);
    
    const total = cartBooks.reduce((sum, b) => sum + (b.price || 0), 0);
    
    DOM.cartContainer.innerHTML = `
        ${cartBooks.map(book => `
            <div class="cart-item">
                <div class="cover-mini">${getCategoryEmoji(book.category)}</div>
                <div class="info">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                </div>
                <div style="font-weight: 700; color: var(--primary-dark);">
                    ${formatNumber(book.price)} บาท
                </div>
                <button class="remove-btn" onclick="removeFromCart('${book.book_id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('')}
        
        <div class="cart-total">
            <span class="total-label">รวมทั้งหมด</span>
            <span class="total-price">${formatNumber(total)} บาท</span>
        </div>
        
        <div style="margin-top: 16px; display: flex; gap: 10px; flex-direction: column;">
            <button class="btn-secondary" onclick="clearCart()">
                <i class="fas fa-trash"></i> ล้างตะกร้า
            </button>
            <a href="https://m.me/ชื่อเพจ" target="_blank" class="btn-facebook">
                <i class="fab fa-facebook-messenger"></i> ส่งรายการสอบถาม
            </a>
        </div>
    `;
    
    updateCartBadge();
}

/**
 * อัปเดตจำนวนสินค้าใน Badge (มุมไอคอนตะกร้า)
 */
function updateCartBadge() {
    DOM.cartCount.textContent = state.cart.length;
    DOM.cartCount.style.display = state.cart.length > 0 ? 'flex' : 'none';
}

// ============================================================
// 6. ACTION FUNCTIONS (ฟังก์ชันการทำงานต่างๆ)
// ============================================================

/**
 * ดูรายละเอียดหนังสือ
 * 
 * @param {string} bookId - รหัสหนังสือ
 */
async function viewBook(bookId) {
    const book = state.books.find(b => b.book_id === bookId);
    if (book) {
        state.currentBookId = bookId;
        renderBookDetail(book);
        navigateTo('detail');
    } else {
        showToast('ไม่พบข้อมูลหนังสือ', 'error');
    }
}

/**
 * คัดลอกรหัสหนังสือ
 * 
 * @param {string} code - รหัสที่ต้องการคัดลอก
 */
function copyBookCode(code) {
    // ใช้ Clipboard API ถ้ารองรับ
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
            .then(() => showToast(`คัดลอกรหัส "${code}" เรียบร้อย!`, 'success'))
            .catch(() => fallbackCopy(code));
    } else {
        fallbackCopy(code);
    }
}

/**
 * วิธีคัดลอกแบบสำรอง (fallback)
 * ใช้สำหรับเบราว์เซอร์ที่ไม่รองรับ Clipboard API
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast(`คัดลอกรหัส "${text}" เรียบร้อย!`, 'success');
    } catch (err) {
        showToast('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยมือ', 'error');
    }
    
    document.body.removeChild(textarea);
}

/**
 * เพิ่มหนังสือในตะกร้า
 * 
 * @param {string} bookId - รหัสหนังสือ
 */
function addToCart(bookId) {
    if (state.cart.includes(bookId)) {
        showToast('หนังสือนี้อยู่ในตะกร้าแล้ว', 'info');
        return;
    }
    state.cart.push(bookId);
    updateCartBadge();
    showToast('เพิ่มหนังสือในตะกร้าเรียบร้อย', 'success');
}

/**
 * ลบหนังสือออกจากตะกร้า
 * 
 * @param {string} bookId - รหัสหนังสือ
 */
function removeFromCart(bookId) {
    state.cart = state.cart.filter(id => id !== bookId);
    updateCartBadge();
    renderCart();
    showToast('ลบออกจากตะกร้าแล้ว', 'info');
}

/**
 * ล้างตะกร้าทั้งหมด
 */
function clearCart() {
    if (state.cart.length === 0) return;
    if (confirm('คุณต้องการล้างตะกร้าทั้งหมดใช่หรือไม่?')) {
        state.cart = [];
        updateCartBadge();
        renderCart();
        showToast('ล้างตะกร้าเรียบร้อย', 'info');
    }
}

/**
 * กรองตามหมวดหมู่ (เรียกจากหน้า Categories)
 * 
 * @param {string} category - ชื่อหมวดหมู่
 */
function filterByCategory(category) {
    state.filterCategory = category;
    state.currentPageIndex = 1;
    navigateTo('all-books');
    
    // อัปเดต active chip ในตัวกรอง
    document.querySelectorAll('#categoryFilters .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === category);
    });
}

/**
 * นำทางไปยังหน้าต่างๆ
 * 
 * @param {string} page - ชื่อหน้า (home, all-books, categories, detail, cart)
 * @param {*} data - ข้อมูลเพิ่มเติม (ไม่จำเป็น)
 */
function navigateTo(page, data = null) {
    // ซ่อนทุกหน้า
    Object.values(DOM.pages).forEach(el => {
        if (el) el.classList.remove('active');
    });
    
    // แสดงหน้าตามที่เลือก
    if (DOM.pages[page]) {
        DOM.pages[page].classList.add('active');
    }
    
    state.currentPage = page;
    
    // ปิดเมนู
    closeMenu();
    
    // รีเฟรชข้อมูลตามหน้า
    switch (page) {
        case 'all-books':
            renderAllBooks();
            break;
        case 'cart':
            renderCart();
            break;
        case 'home':
            // ไม่ต้องทำอะไร เพราะข้อมูลถูกแสดงตอนโหลดแล้ว
            break;
        default:
            break;
    }
    
    // Scroll ไปด้านบน
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * เปิด/ปิด Side Menu
 */
function toggleMenu() {
    DOM.sideMenu.classList.toggle('open');
    DOM.overlay.classList.toggle('active');
    document.body.style.overflow = DOM.sideMenu.classList.contains('open') ? 'hidden' : '';
}

/**
 * ปิด Side Menu
 */
function closeMenu() {
    DOM.sideMenu.classList.remove('open');
    DOM.overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * เปิด/ปิด Search Bar
 */
function toggleSearch() {
    DOM.searchBar.classList.toggle('active');
    if (DOM.searchBar.classList.contains('active')) {
        DOM.searchInput.focus();
    }
}

// ============================================================
// 7. EVENT LISTENERS (การจัดการเหตุการณ์)
// ============================================================

/**
 * ตั้งค่า Event Listeners ทั้งหมด
 */
function setupEventListeners() {
    // ---- Side Menu ----
    DOM.btnMenu.addEventListener('click', toggleMenu);
    DOM.menuClose.addEventListener('click', closeMenu);
    DOM.overlay.addEventListener('click', closeMenu);
    
    // ---- Search ----
    DOM.btnSearch.addEventListener('click', toggleSearch);
    DOM.searchClose.addEventListener('click', toggleSearch);
    DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        state.currentPageIndex = 1;
        if (state.currentPage === 'all-books') {
            renderAllBooks();
        }
    });
    
    // ---- Cart Button ----
    DOM.btnCart.addEventListener('click', () => navigateTo('cart'));
    
    // ---- Detail Back ----
    DOM.detailBack.addEventListener('click', () => {
        // กลับไปหน้าก่อนหน้า (all-books หรือ home)
        navigateTo('all-books');
    });
    
    // ---- Load More ----
    DOM.loadMoreBtn.addEventListener('click', () => {
        state.currentPageIndex++;
        renderAllBooks();
    });
    
    // ---- Category Filters ----
    DOM.categoryFilters.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        
        DOM.categoryFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        state.filterCategory = chip.dataset.filter;
        state.currentPageIndex = 1;
        renderAllBooks();
    });
    
    // ---- Level Filters ----
    DOM.levelFilters.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        
        DOM.levelFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        state.filterLevel = chip.dataset.filter;
        state.currentPageIndex = 1;
        renderAllBooks();
    });
    
    // ---- Menu Navigation ----
    document.querySelectorAll('.menu-list a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // ---- Footer Navigation ----
    document.querySelectorAll('.footer-links a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // ---- Facebook (Menu) ----
    DOM.menuFacebook.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://m.me/ชื่อเพจ', '_blank');
        closeMenu();
    });
    
    // ---- Social Footer ----
    DOM.footerFacebook.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://www.facebook.com/ชื่อเพจ', '_blank');
    });
    DOM.footerLine.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('กำลังพัฒนาช่องทาง Line', 'info');
    });
    DOM.footerYoutube.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('กำลังพัฒนาช่องทาง YouTube', 'info');
    });
    
    // ---- Keyboard Shortcuts ----
    document.addEventListener('keydown', (e) => {
        // ESC: ปิดเมนูหรือปิด Search
        if (e.key === 'Escape') {
            if (DOM.sideMenu.classList.contains('open')) closeMenu();
            if (DOM.searchBar.classList.contains('active')) toggleSearch();
        }
        // Ctrl+K หรือ Cmd+K: เปิด Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleSearch();
        }
    });
}

// ============================================================
// 8. INITIALIZATION (เริ่มต้นระบบ)
// ============================================================

/**
 * เริ่มต้นระบบ (เรียกเมื่อ DOM พร้อม)
 */
async function init() {
    console.log('📚 หนังสือต่างถิ่น - กำลังเริ่มต้น...');
    console.log('📊 ใช้ Google Sheets เป็นฐานข้อมูล');
    
    // ตั้งค่า ปี ค.ศ.
    DOM.currentYear.textContent = new Date().getFullYear();
    
    // แสดง Loading
    DOM.featuredBooks.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div>';
    
    // โหลดข้อมูลจาก Google Sheets
    state.books = await fetchBooks();
    
    // แสดงข้อมูล
    renderHome(state.books);
    renderCategories(state.books);
    renderAllBooks();
    updateCartBadge();
    
    // ตั้งค่า Event Listeners
    setupEventListeners();
    
    // ไปหน้าแรก
    navigateTo('home');
    
    console.log(`✅ โหลดข้อมูลสำเร็จ: ${state.books.length} เล่ม`);
    console.log('📖 พร้อมใช้งานแล้ว!');
}

/**
 * เมื่อ DOM พร้อม ให้เริ่มต้นระบบ
 */
document.addEventListener('DOMContentLoaded', init);

// ============================================================
// 9. EXPOSE TO GLOBAL (สำหรับเรียกจาก onclick ใน HTML)
// ============================================================

/**
 * ทำให้ฟังก์ชันเหล่านี้เป็น Global
 * เพื่อให้สามารถเรียกจาก onclick ใน HTML ได้
 */
window.viewBook = viewBook;
window.copyBookCode = copyBookCode;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.filterByCategory = filterByCategory;
window.navigateTo = navigateTo;
window.toggleSearch = toggleSearch;