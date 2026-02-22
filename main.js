document.addEventListener('DOMContentLoaded', () => {

    // 1. ФИКС ДЛЯ МОБИЛЬНЫХ (Превращаем все number в text для поддержки запятых)
    document.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.setAttribute('type', 'text');
        inp.setAttribute('inputmode', 'decimal');
    });

    // Умный парсер чисел (понимает и точку, и запятую)
    const parseVal = (val) => parseFloat(val.toString().replace(',', '.')) || 0;

    // --- БАЗА ИКОНОК ---
    const SVGS = {
        arrow: `<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
        types: {
            'fianite': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 2 8 12 22 22 8 12 2"/><line x1="2" y1="8" x2="22" y2="8"/></svg>`,
            'diamond': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 2 8 12 22 22 8 12 2"/><line x1="2" y1="8" x2="22" y2="8"/><polyline points="12 2 12 22"/><polyline points="12 2 6 8 12 22"/><polyline points="12 2 18 8 12 22"/></svg>`,
            'amber': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 7.477 2 13s4.477 9 10 9z"/></svg>`,
            'pearl': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/></svg>`,
            'enamel': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22C6.477 22 2 17.523 2 12c0-4.418 4.25-9.633 8.35-13.8a2.5 2.5 0 0 1 3.3 0C17.75 2.367 22 7.582 22 12c0 5.523-4.477 10-10 10z"/></svg>`
        },
        shapes: {
            'krug': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/></svg>`,
            'oval': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="6" ry="10"/></svg>`,
            'baget': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="3" width="10" height="18" rx="1"/></svg>`,
            'kvadrat': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>`,
            'markiz': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C18 8 18 16 12 22C6 16 6 8 12 2Z"/></svg>`,
            'grusha': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C12 2 6 10 6 15A6 6 0 0 0 18 15C18 10 12 2 12 2Z"/></svg>`,
            'oktagon': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="8 3 16 3 21 8 21 16 16 21 8 21 3 16 3 8"/></svg>`,
            'serdtse': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
            'treugolnik': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 3 3 20 21 20"/></svg>`,
            'trillion': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3C15 9 21 19 21 19C16 21 8 21 3 19C3 19 9 9 12 3Z"/></svg>`,
            'shar': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/></svg>`
        },
        names: {
            'fianite': 'Фианит', 'diamond': 'Бриллиант', 'amber': 'Янтарь', 'pearl': 'Жемчуг', 'enamel': 'Эмаль',
            'krug': 'Круг', 'oval': 'Овал', 'baget': 'Багет', 'kvadrat': 'Квадрат', 'markiz': 'Маркиз', 'grusha': 'Груша',
            'oktagon': 'Октагон', 'serdtse': 'Сердце', 'treugolnik': 'Треугольник', 'trillion': 'Триллион', 'shar': 'Шар'
        }
    };

    const stoneCoeffs = { 'krug':0.0135, 'baget':0.02175, 'grusha':0.013125, 'kvadrat':0.01725, 'markiz':0.012, 'oval':0.015, 'oktagon':0.018375, 'serdtse':0.01575, 'treugolnik':0.0135, 'trillion':0.01275, 'shar':0.019425 };
    const BASE_SELLING_PRICE = 6500; 
    let currentLoanTotal = 0; 

    // --- НАСТРОЙКА ДАТЫ ДЛЯ ПРОЦЕНТОВ ---
    const targetDateInput = document.getElementById('targetDate');
    const today = new Date();
    today.setHours(0,0,0,0);
    const pad = n => String(n).padStart(2, '0');
    
    if (targetDateInput) {
        targetDateInput.min = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
        const defDate = new Date(); defDate.setDate(defDate.getDate() + 31);
        targetDateInput.value = `${defDate.getFullYear()}-${pad(defDate.getMonth()+1)}-${pad(defDate.getDate())}`;
    }

    // --- ГЛАВНАЯ ФУНКЦИЯ РАСЧЕТА ---
    function calculate() {
        const totalWeightEl = document.getElementById('totalWeight');
        const totalW = totalWeightEl ? parseVal(totalWeightEl.value) : 0;
        
        const isHollow = document.getElementById('isHollow').checked;
        const isBuyout = document.getElementById('isBuyout').checked; 
        const insSwitch = document.getElementById('isInsured');
        
        const purityEl = document.querySelector('input[name="purity"]:checked');
        const purity = purityEl ? parseFloat(purityEl.value) : 585;
        
        const itemTypeEl = document.querySelector('input[name="itemType"]:checked');
        const itemDeduct = itemTypeEl ? parseFloat(itemTypeEl.value) : 0.1;

        // 1. Управление логикой Скупка/Залог
        if (isBuyout) {
            document.getElementById('op-status').innerText = "Скупка";
            document.getElementById('price-group-zalog').style.display = 'none';
            document.getElementById('price-group-skupka').style.display = 'flex';
            document.getElementById('margin-block').style.display = 'block'; 
            document.getElementById('interest-block').style.display = 'none'; 
            
            insSwitch.checked = true; 
            document.getElementById('ins-container').style.pointerEvents = 'none';
            document.getElementById('ins-container').style.opacity = '0.6';
            document.getElementById('ins-status').innerText = "Обязательно (Скупка)";
        } else {
            document.getElementById('op-status').innerText = "Залог";
            document.getElementById('price-group-zalog').style.display = 'flex';
            document.getElementById('price-group-skupka').style.display = 'none';
            document.getElementById('margin-block').style.display = 'none'; 
            document.getElementById('interest-block').style.display = 'block'; 
            
            document.getElementById('ins-container').style.pointerEvents = 'auto';
            document.getElementById('ins-container').style.opacity = '1';
            document.getElementById('ins-status').innerText = insSwitch.checked ? "Включена (База)" : "Отключена (Снижен)";
        }

        const isInsured = insSwitch.checked;

        // 2. Обновление цен на кнопках при смене пробы
        document.querySelectorAll('.radio-label input[name^="price_"]').forEach(radio => {
            const base = parseFloat(radio.value);
            const calc = Math.round(base * (purity / 585));
            const btn = radio.nextElementSibling;
            if(btn && btn.querySelector('.calc-val')) {
                btn.querySelector('.calc-val').innerText = calc.toLocaleString('ru-RU') + ' ₽';
                btn.querySelector('.base-val').innerText = '(' + base.toLocaleString('ru-RU') + ' ₽)';
            }
        });

        // 3. Вычеты и Корзина (Камни теперь считаются ВСЕГДА)
        let stonesGramsTotal = 0;
        let cartHTML = '';

        if (totalW > 0) {
            if (itemDeduct === 0.1) {
                cartHTML += `<div class="cart-item"><span class="item-name">Загрязнение х1</span><span class="dots"></span><span class="item-val">-0.100 г</span></div>`;
            } else if (itemDeduct === 0.15) {
                cartHTML += `<div class="cart-item"><span class="item-name">Загрязнение х1</span><span class="dots"></span><span class="item-val">-0.100 г</span></div>`;
                cartHTML += `<div class="cart-item"><span class="item-name">Замок х1</span><span class="dots"></span><span class="item-val">-0.050 г</span></div>`;
            }
        }

        document.querySelectorAll('.stone-row').forEach(row => {
            const type = row.querySelector('.val-t').value;
            const shape = row.querySelector('.val-shape').value;
            const summaryTextEl = row.querySelector('.summary-text');
            
            const lInput = row.querySelector('.s-l');
            const wInput = row.querySelector('.s-w');
            const hInput = row.querySelector('.s-h');
            const qtyInput = row.querySelector('.s-q');
            
            const L = parseVal(lInput.value);
            const W = parseVal(wInput.value) || L;
            const H = parseVal(hInput.value) || (W * 0.6);
            const Q = parseInt(qtyInput.value) || 1;
            
            let iconSVG = SVGS.types[type] || SVGS.types.fianite;
            if(type !== 'enamel' && type !== 'pearl' && type !== 'amber') {
                iconSVG = SVGS.shapes[shape] || iconSVG;
            }

            if (L > 0) {
                let gram = 0; let ct = 0;
                if (type === 'enamel') {
                    gram = (L * W / 100) * 0.1 * Q;
                } else if (type === 'pearl') {
                    ct = Math.pow(L, 3) * 0.01295 * Q; gram = ct * 0.2;
                } else if (type === 'amber') {
                    ct = L * W * H * 0.0065 * Q; gram = ct * 0.2;
                } else {
                    ct = L * W * H * (stoneCoeffs[shape] || 0.0135);
                    if (type === 'diamond') ct *= (0.0037 / 0.0081);
                    ct *= Q; gram = ct * 0.2;
                }
                
                stonesGramsTotal += gram;
                
                const displayName = SVGS.names[type] + (type==='enamel'||type==='pearl'||type==='amber' ? '' : ' ' + SVGS.names[shape]);
                
                // Бейдж свернутой вставки
                summaryTextEl.innerHTML = `
                    <span class="summary-icon">${iconSVG}</span>
                    <span style="color:var(--text-main); margin-left:4px;">${displayName}</span>
                    <span class="badge-qty">${Q} шт</span>
                    <div class="summary-result">
                        <b style="color:var(--danger);">-${gram.toFixed(3)} г</b>
                        ${ct > 0 ? `<span style="color:var(--text-secondary); font-size:11px;">(${ct.toFixed(2)} ct)</span>` : ''}
                    </div>
                `;
                
                if (totalW > 0) {
                    cartHTML += `<div class="cart-item"><span class="item-name">${displayName} x${Q}</span><span class="dots"></span><span class="item-val">-${gram.toFixed(3)} г</span></div>`;
                }
            } else {
                summaryTextEl.innerHTML = `
                    <span class="summary-icon">${iconSVG}</span>
                    <span style="margin-left:8px; color:var(--text-secondary);">Вставка (нажмите для ввода)</span>
                `;
            }
        });

        // Пустотелость и Итог веса
        if (totalW > 0) {
            if (isHollow) {
                const hd = totalW * 0.05; stonesGramsTotal += hd;
                cartHTML += `<div class="cart-item"><span class="item-name">Пустотелость (5%)</span><span class="dots"></span><span class="item-val">-${hd.toFixed(3)} г</span></div>`;
            }
            if (totalW > 20) {
                const hv = totalW * 0.005; stonesGramsTotal += hv;
                cartHTML += `<div class="cart-item"><span class="item-name">Свыше 20г (0.5%)</span><span class="dots"></span><span class="item-val">-${hv.toFixed(3)} г</span></div>`;
            }
        }

        const netW = Math.max(0, totalW - itemDeduct - stonesGramsTotal);
        document.getElementById('netWeight').value = netW.toFixed(3);
        
        if (totalW > 0) {
            document.getElementById('cart-container').style.display = 'block';
            document.getElementById('cart-items').innerHTML = cartHTML;
            document.getElementById('cart-net-weight').innerText = netW.toFixed(3) + ' г';
        } else {
            document.getElementById('cart-container').style.display = 'none';
        }

        // 4. Расчет Денег и Лимитов
        const btn7000 = document.getElementById('btn7000');
        let selectedBase = 0;
        
        if (isBuyout) {
            const radio = document.querySelector('input[name="price_skupka"]:checked');
            if(radio) selectedBase = parseFloat(radio.value);
            if(btn7000) btn7000.disabled = false;
            document.getElementById('limitMsg').style.display = 'none';
        } else {
            const checkPrice = isInsured ? 7000 : 6300;
            const checkTotal = Math.round(netW * Math.round(checkPrice * (purity/585)));
            
            if (checkTotal > 150000) {
                if(btn7000) btn7000.disabled = true;
                document.getElementById('limitMsg').style.display = 'flex';
                if (btn7000 && btn7000.checked) {
                    const btn6k = document.querySelector('input[name="price_zalog"][value="6000"]');
                    if(btn6k) btn6k.checked = true;
                }
            } else {
                if(btn7000) btn7000.disabled = false;
                document.getElementById('limitMsg').style.display = 'none';
            }
            const radio = document.querySelector('input[name="price_zalog"]:checked');
            if(radio) selectedBase = parseFloat(radio.value);
        }

        const actualPrice = Math.round(selectedBase * (purity / 585));
        const amountHand = Math.round(netW * actualPrice);
        
        document.getElementById('res-base-price').innerText = selectedBase.toLocaleString('ru-RU') + ' ₽';
        document.getElementById('res-actual-price').innerText = actualPrice.toLocaleString('ru-RU') + ' ₽';
        document.getElementById('res-purity-label').innerText = purity;

        if (isBuyout) {
            const margin = Math.round((Math.round(BASE_SELLING_PRICE * (purity / 585)) - actualPrice) * netW);
            document.getElementById('res-margin').innerText = margin.toLocaleString('ru-RU') + ' ₽';
        }

        if (isInsured && !isBuyout) {
            document.getElementById('insurance-blocks').style.display = 'block';
            const ins = Math.round(amountHand * 0.2376);
            currentLoanTotal = amountHand + ins;
            document.getElementById('res-hand').innerText = amountHand.toLocaleString('ru-RU') + ' ₽';
            document.getElementById('res-ins').innerText = ins.toLocaleString('ru-RU') + ' ₽';
            document.getElementById('res-total').innerText = currentLoanTotal.toLocaleString('ru-RU') + ' ₽';
            document.getElementById('total-label').innerText = "Сумма займа:";
        } else {
            document.getElementById('insurance-blocks').style.display = 'none';
            currentLoanTotal = amountHand;
            document.getElementById('res-total').innerText = amountHand.toLocaleString('ru-RU') + ' ₽';
            document.getElementById('total-label').innerText = "К выдаче на руки:";
        }

        updateInterest();
    }

    // --- РАСЧЕТ ПРОЦЕНТОВ ПО ЗАЛОГУ ---
    function updateInterest() {
        if (document.getElementById('isBuyout').checked || currentLoanTotal === 0 || !targetDateInput) {
            document.getElementById('int-days').innerText = "0";
            document.getElementById('int-percent').innerText = "0.000%";
            document.getElementById('int-sum').innerText = "0 ₽";
            document.getElementById('int-total-return').innerText = "0 ₽";
            return;
        }
        
        const tDate = new Date(targetDateInput.value);
        tDate.setHours(0,0,0,0);

        const diffTime = tDate.getTime() - today.getTime();
        let days = Math.floor(diffTime / (1000 * 3600 * 24)) + 1;
        if (days < 1) days = 1;
        
        let rate = 0;
        if (days > 1) rate += Math.min(days - 1, 5) * 0.402;
        if (days > 6) rate += Math.min(days - 6, 17) * 0.128;
        if (days > 23) rate += (days - 23) * 0.578;

        const sum = Math.round(currentLoanTotal * (rate / 100));
        document.getElementById('int-days').innerText = days;
        document.getElementById('int-percent').innerText = rate.toFixed(3) + '%';
        document.getElementById('int-sum').innerText = sum.toLocaleString('ru-RU') + ' ₽';
        document.getElementById('int-total-return').innerText = (currentLoanTotal + sum).toLocaleString('ru-RU') + ' ₽';
    }

    // --- УТИЛИТА МЕНЮ ---
    function buildOptions(dataObj, sourceDict) {
        return Object.keys(dataObj).map(k => `<div class="select-option" data-val="${k}">${dataObj[k]} ${sourceDict[k]}</div>`).join('');
    }

    // --- ДОБАВЛЕНИЕ КАМНЯ ---
    const btnAddStone = document.getElementById('btnAddStone');
    if(btnAddStone) {
        btnAddStone.onclick = () => {
            document.querySelectorAll('.stone-row').forEach(r => r.classList.add('collapsed'));

            const div = document.createElement('div');
            div.className = 'stone-row';
            div.dataset.shape = 'krug';
            
            div.innerHTML = `
                <div class="stone-content">
                    <div class="stone-inputs">
                        <div class="custom-select s-t-wrap">
                            <div class="select-trigger"><div class="trig-content">${SVGS.types.fianite} Фианит</div>${SVGS.arrow}</div>
                            <div class="select-options">${buildOptions(SVGS.types, SVGS.names)}</div>
                            <input type="hidden" class="val-t" value="fianite">
                        </div>
                        <div class="custom-select s-shape-wrap">
                            <div class="select-trigger"><div class="trig-content">${SVGS.shapes.krug} Круг</div>${SVGS.arrow}</div>
                            <div class="select-options">${buildOptions(SVGS.shapes, SVGS.names)}</div>
                            <input type="hidden" class="val-shape" value="krug">
                        </div>
                        <input type="text" inputmode="decimal" class="glass-input s-l" placeholder="Ø">
                        <input type="text" inputmode="decimal" class="glass-input s-w" placeholder="Д2">
                        <input type="text" inputmode="decimal" class="glass-input s-h" placeholder="Выс" data-auto="true">
                        <input type="text" inputmode="decimal" class="glass-input s-q" value="1" min="1">
                    </div>
                    <div class="stone-summary">
                        <div class="summary-text"><span class="summary-icon">${SVGS.types.fianite}</span><span style="margin-left:8px; color:var(--text-secondary);">Вставка (нажмите для ввода)</span></div>
                    </div>
                </div>
                <button class="btn-remove" title="Удалить">×</button>
            `;

            const typeWrap = div.querySelector('.s-t-wrap');
            const shapeWrap = div.querySelector('.s-shape-wrap');
            const sType = div.querySelector('.val-t');
            const sShape = div.querySelector('.val-shape');
            const lInp = div.querySelector('.s-l');
            const wInp = div.querySelector('.s-w');
            const hInp = div.querySelector('.s-h');

            const updateUI = () => {
                const t = sType.value; 
                
                // Умный Бриллиант (оставляем только круг)
                if (t === 'diamond') {
                    sShape.value = 'krug';
                    shapeWrap.querySelector('.trig-content').innerHTML = `${SVGS.shapes.krug} Круг`;
                    shapeWrap.querySelector('.select-options').innerHTML = buildOptions({'krug': SVGS.shapes.krug}, SVGS.names);
                    reattachSelectEvents(shapeWrap);
                } else if (t === 'fianite' || t === 'amber') {
                    shapeWrap.querySelector('.select-options').innerHTML = buildOptions(SVGS.shapes, SVGS.names);
                    reattachSelectEvents(shapeWrap);
                }

                const s = sShape.value;
                div.dataset.shape = s;
                div.dataset.type = t;

                shapeWrap.style.display = (t==='enamel'||t==='pearl'||t==='amber') ? 'none' : 'block';
                wInp.style.display = (s==='krug'||s==='shar'||s==='kvadrat'||t==='pearl') ? 'none' : 'block';
                hInp.style.display = (s==='krug'||s==='shar'||t==='pearl') ? 'none' : 'block';
                hInp.disabled = false;
                
                if (t==='enamel') { lInp.placeholder="Дл"; wInp.placeholder="Шир"; hInp.placeholder="см²"; hInp.style.display="block"; hInp.disabled=true; }
                else if (t==='pearl') { lInp.placeholder="Ø"; }
                else { lInp.placeholder = (s==='krug'||s==='shar') ? 'Ø' : 'Д1'; }
                
                autoCalc();
            };

            const autoCalc = () => {
                const t = sType.value; const l = parseVal(lInp.value); const w = parseVal(wInp.value) || l;
                if (t === 'enamel') hInp.value = l > 0 ? ((l * w) / 100).toFixed(2) : "";
                else if (t !== 'pearl' && l > 0 && hInp.dataset.auto === "true") hInp.value = (w * 0.6).toFixed(2);
                else if (l === 0 && w === 0 && hInp.dataset.auto === "true") hInp.value = "";
                calculate();
            };

            function reattachSelectEvents(sel) {
                sel.querySelectorAll('.select-option').forEach(opt => {
                    opt.onclick = () => {
                        sel.querySelector('.trig-content').innerHTML = opt.innerHTML;
                        sel.querySelector('input').value = opt.dataset.val;
                        sel.classList.remove('open');
                        updateUI();
                    };
                });
            }

            div.querySelectorAll('.custom-select').forEach(sel => {
                sel.querySelector('.select-trigger').onclick = () => {
                    const state = sel.classList.contains('open');
                    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('open'));
                    if(!state) sel.classList.add('open');
                };
                reattachSelectEvents(sel);
            });

            lInp.addEventListener('input', autoCalc);
            wInp.addEventListener('input', autoCalc);
            hInp.addEventListener('input', () => { hInp.dataset.auto = hInp.value === '' ? "true" : "false"; autoCalc(); });
            div.querySelector('.s-q').addEventListener('input', calculate);
            div.querySelector('.btn-remove').onclick = () => { div.remove(); calculate(); };
            
            document.getElementById('stones-container').appendChild(div);
            updateUI();
        };
    }

    // --- ГЛОБАЛЬНЫЕ СЛУШАТЕЛИ СОБЫТИЙ (Делегирование) ---
    document.addEventListener('click', (e) => {
        // Закрытие дропдаунов при клике мимо
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('open'));
        }
        
        // Открытие процентов
        if (e.target.closest('#btn-interest-toggle')) {
            document.getElementById('btn-interest-toggle').classList.toggle('open');
        }

        // Логика аккордеона камней
        const summary = e.target.closest('.stone-summary');
        if (summary) {
            const row = summary.closest('.stone-row');
            document.querySelectorAll('.stone-row').forEach(r => r.classList.add('collapsed'));
            row.classList.remove('collapsed');
        } else if (!e.target.closest('.stone-row') && !e.target.closest('#btnAddStone') && !e.target.closest('.btn-remove')) {
            document.querySelectorAll('.stone-row').forEach(r => r.classList.add('collapsed'));
        }
    });

    // Живой пересчет при любом вводе в текстовые поля и переключении кнопок
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && (e.target.type === 'text' || e.target.type === 'number')) calculate();
    });
    document.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' && (e.target.type === 'radio' || e.target.type === 'checkbox')) calculate();
    });

    // Первичный расчет при загрузке страницы
    calculate();

});
