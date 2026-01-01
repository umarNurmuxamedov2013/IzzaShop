document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    // Check for saved user preference, default to DARK
    const savedTheme = localStorage.getItem('theme');
    // If no theme saved, or saved is dark, set dark.
    if (savedTheme === 'dark' || !savedTheme) {
        document.body.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // --- ScrollSpy Logic ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) { // Offset for fixed header
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if href matches current ID (parsing the full URL)
            const href = link.getAttribute('href');
            if (href.includes('#' + current)) {
                link.classList.add('active');
            } else if (current === 'home' && href.endsWith('home') && !href.includes('#')) {
                // Special case for 'Home' if strict match
                link.classList.add('active');
            }
            // Fallback for "Bosh sahifa" linking to just home url
            if (current === 'home' && (href === '/' || href === window.location.pathname)) {
                link.classList.add('active');
            }
        });
    });


    // --- Wishlist Logic ---
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    // Initialize state
    wishlistIcons.forEach(icon => {
        const slug = icon.getAttribute('data-slug');
        if (wishlist.includes(slug)) {
            icon.classList.add('liked');
            const i = icon.querySelector('i');
            if (i) {
                i.classList.remove('far');
                i.classList.add('fas');
            }
        }

        icon.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Stop card click

            const slug = this.getAttribute('data-slug');
            const index = wishlist.indexOf(slug);

            if (index === -1) {
                wishlist.push(slug);
                this.classList.add('liked');
                this.querySelector('i').classList.remove('far');
                this.querySelector('i').classList.add('fas');
            } else {
                wishlist.splice(index, 1);
                this.classList.remove('liked');
                this.querySelector('i').classList.remove('fas');
                this.querySelector('i').classList.add('far');
            }
            localStorage.setItem('wishlist', JSON.stringify(wishlist));

            // Sync other icons
            document.querySelectorAll(`.wishlist-icon[data-slug="${slug}"]`).forEach(other => {
                if (other !== this) {
                    if (wishlist.includes(slug)) {
                        other.classList.add('liked');
                        other.querySelector('i').classList.remove('far');
                        other.querySelector('i').classList.add('fas');
                    } else {
                        other.classList.remove('liked');
                        other.querySelector('i').classList.remove('fas');
                        other.querySelector('i').classList.add('far');
                    }
                }
            });
            updateBadges();
        });
    });

    // --- Wishlist Page Filtering ---
    const wishlistContainer = document.getElementById('wishlist-container');
    if (wishlistContainer) {
        const products = wishlistContainer.querySelectorAll('.product-card');
        let hasItems = false;
        products.forEach(card => {
            const icon = card.querySelector('.wishlist-icon');
            if (icon) {
                const slug = icon.getAttribute('data-slug');
                if (!wishlist.includes(slug)) {
                    card.style.display = 'none';
                } else {
                    hasItems = true;
                }
            }
        });

        // Toggle empty message
        const emptyMsg = wishlistContainer.querySelector('.empty-wishlist');
        if (emptyMsg) {
            emptyMsg.style.display = hasItems ? 'none' : 'block';
        }
    }

    // --- Cart Logic (LocalStorage) ---
    const cart = JSON.parse(localStorage.getItem('cart') || '[]'); // Structure: [{slug: 'abc', qty: 1}, ...]

    // Normalize old cart structure if it was just array of strings
    let normalizedCart = [];
    if (cart.length > 0 && typeof cart[0] === 'string') {
        normalizedCart = cart.map(slug => ({ slug: slug, qty: 1 }));
        localStorage.setItem('cart', JSON.stringify(normalizedCart));
    } else {
        normalizedCart = cart;
    }

    const cartBtns = document.querySelectorAll('.add-to-cart-btn');

    // Check Status on Load
    cartBtns.forEach(btn => {
        // Find slug context
        const card = btn.closest('.product-card') || btn.closest('.detail-info');
        let slug = null;
        if (card) {
            const icon = card.querySelector('.wishlist-icon') || document.querySelector('.detail-image .wishlist-icon') || document.querySelector('.wishlist-icon[data-slug]');
            if (icon) slug = icon.getAttribute('data-slug');
        }

        if (slug) {
            btn.setAttribute('data-slug', slug); // Cache it
            if (normalizedCart.some(item => item.slug === slug)) {
                btn.innerText = "Savatga qo'shildi";
                btn.classList.add('added');
            }
        }

        // Click Handler
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const slug = this.getAttribute('data-slug');
            if (slug) {
                const existingItem = normalizedCart.find(item => item.slug === slug);
                if (!existingItem) {
                    normalizedCart.push({ slug: slug, qty: 1 });
                    this.innerText = "Savatga qo'shildi";
                    this.classList.add('added'); // Trigger green shadow
                }
                localStorage.setItem('cart', JSON.stringify(normalizedCart));
                updateBadges();
            }
        });
    });

    function updateBadges() {
        const wishlistCount = JSON.parse(localStorage.getItem('wishlist') || '[]').length;
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartCount = currentCart.length;

        const wBadge = document.getElementById('wishlist-count');
        const cBadge = document.getElementById('cart-count');

        if (wBadge) {
            wBadge.innerText = wishlistCount;
            if (wishlistCount > 0) {
                wBadge.classList.add('visible');
                wBadge.style.display = 'flex';
            } else {
                wBadge.classList.remove('visible');
                wBadge.style.display = 'none';
            }
        }

        if (cBadge) {
            cBadge.innerText = cartCount;
            if (cartCount > 0) {
                cBadge.classList.add('visible');
                cBadge.style.display = 'flex';
            } else {
                cBadge.classList.remove('visible');
                cBadge.style.display = 'none';
            }
        }
    }

    // --- Cart Page Logic ---
    const cartItemsWrapper = document.getElementById('cart-items-wrapper');
    if (cartItemsWrapper) {
        let currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        // Handle migration if string array
        if (currentCart.length > 0 && typeof currentCart[0] === 'string') {
            currentCart = currentCart.map(s => ({ slug: s, qty: 1 }));
        }

        const allProductDivs = cartItemsWrapper.querySelectorAll('.cart-item');
        let total = 0;
        let hasItems = false;

        allProductDivs.forEach(div => {
            const slug = div.getAttribute('data-slug');
            const cartItem = currentCart.find(i => i.slug === slug);

            if (cartItem) {
                hasItems = true;
                div.style.display = 'flex';
                // Set Qty
                div.querySelector('.qty-display').innerText = cartItem.qty;

                // Calc Price
                const priceEl = div.querySelector('.cart-item-price');
                const rawPrice = parseFloat(priceEl.getAttribute('data-price'));
                total += rawPrice * cartItem.qty;
            } else {
                div.remove(); // Remove items not in cart from DOM to clean up
            }
        });

        const emptyMsg = document.getElementById('empty-cart-msg');
        const summary = document.getElementById('cart-summary');

        if (hasItems) {
            if (emptyMsg) emptyMsg.style.display = 'none';
            if (summary) summary.style.display = 'block';
            document.getElementById('total-price').innerText = '$' + total.toFixed(2);
        } else {
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (summary) summary.style.display = 'none';
        }

        // Expose global functions for onclick
        window.updateQty = function (btn, change) {
            const card = btn.closest('.cart-item');
            const slug = card.getAttribute('data-slug');
            const item = currentCart.find(i => i.slug === slug);

            if (item) {
                item.qty += change;
                if (item.qty < 1) item.qty = 1; // Minimum 1

                // Save
                localStorage.setItem('cart', JSON.stringify(currentCart));

                // Update UI visually without reload
                card.querySelector('.qty-display').innerText = item.qty;
                recalcTotal();
            }
        };

        window.removeFromCart = function (btn) {
            const card = btn.closest('.cart-item');
            const slug = card.getAttribute('data-slug');
            const idx = currentCart.findIndex(i => i.slug === slug);

            if (idx > -1) {
                currentCart.splice(idx, 1);
                localStorage.setItem('cart', JSON.stringify(currentCart));
                card.remove();
                recalcTotal();
                updateBadges(); // Sync badge immediately
            }
        };

        function recalcTotal() {
            let newTotal = 0;
            let count = 0;
            const visibleItems = document.querySelectorAll('.cart-item');
            visibleItems.forEach(item => {
                const slug = item.getAttribute('data-slug');
                const cartItem = currentCart.find(i => i.slug === slug);
                if (cartItem) {
                    const price = parseFloat(item.querySelector('.cart-item-price').getAttribute('data-price'));
                    newTotal += price * cartItem.qty;
                    count++;
                }
            });

            document.getElementById('total-price').innerText = '$' + newTotal.toFixed(2);

            if (count === 0) {
                if (emptyMsg) emptyMsg.style.display = 'block';
                if (summary) summary.style.display = 'none';
            }
        }
    }

    // Initial Badge Load
    updateBadges();
});
