// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations and interactions
    initScrollAnimations();
    initDiscordButton();
    initSmoothScrolling();
    initParticleAnimation();
    initServiceForm();
    
    // Track page view
    trackPageView();
});

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.delay || 0;
                
                setTimeout(() => {
                    element.classList.add('visible');
                }, delay);
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// Discord button functionality
function initDiscordButton() {
    const discordButton = document.getElementById('discordButton');
    
    // Add click effect
    discordButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Track Discord join and redirect
        setTimeout(() => {
            // Track the Discord join
            trackDiscordJoin();
            
            // Replace with your actual Discord invite link
            // window.open('https://discord.gg/your-invite-code', '_blank');
            console.log('Discord button clicked - add your Discord invite link here');
        }, 300);
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    // Scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const servicesSection = document.querySelector('.services-section');
            servicesSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const particles = document.querySelectorAll('.particle');
        
        // Parallax effect for hero content
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        
        // Parallax effect for particles
        particles.forEach((particle, index) => {
            const speed = 0.3 + (index * 0.1);
            particle.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Enhanced particle animation
function initParticleAnimation() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach((particle, index) => {
        // Random initial positions
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        
        particle.style.left = randomX + '%';
        particle.style.top = randomY + '%';
        
        // Add glow effect on hover
        particle.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.8)';
            this.style.transform = 'scale(1.5)';
        });
        
        particle.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
            this.style.transform = 'scale(1)';
        });
        
        // Random movement animation
        setInterval(() => {
            const newX = Math.random() * 100;
            const newY = Math.random() * 100;
            
            particle.style.transition = 'all 3s ease-in-out';
            particle.style.left = newX + '%';
            particle.style.top = newY + '%';
        }, 5000 + (index * 1000));
    });
}

// Add CSS for ripple animation
const rippleCSS = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle rotation on hover
            this.style.transform = 'translateY(-10px) rotateY(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateY(0)';
        });
    });
});

// Typing effect for tagline (optional enhancement)
function initTypingEffect() {
    const tagline = document.querySelector('.tagline');
    const text = tagline.textContent;
    tagline.textContent = '';
    
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            tagline.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
        }
    }, 50);
}

// Initialize typing effect after a delay
setTimeout(initTypingEffect, 1500);

// Smooth scroll to top functionality
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show/hide scroll to top button (you can add this button if needed)
    if (scrollTop > 300) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

// Performance optimization: throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScroll = throttle(() => {
    // Scroll-based animations can be added here
}, 16); // ~60fps

window.addEventListener('scroll', throttledScroll);

// API Integration Functions
async function trackPageView() {
    try {
        await fetch('http://localhost:3001/api/track-view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page: window.location.pathname,
                userAgent: navigator.userAgent,
                ipAddress: null // Will be handled server-side
            })
        });
    } catch (error) {
        console.log('Analytics tracking unavailable');
    }
}

async function trackDiscordJoin() {
    try {
        await fetch('http://localhost:3001/api/track-discord-join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source: 'website'
            })
        });
    } catch (error) {
        console.log('Discord join tracking unavailable');
    }
}

// Service request form functionality
function initServiceForm() {
    const form = document.getElementById('serviceForm');
    const statusDiv = document.getElementById('form-status');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('.submit-button');
        const originalButtonText = submitButton.innerHTML;
        
        // Disable form and show loading
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        statusDiv.className = 'form-status';
        statusDiv.style.display = 'none';
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            contact: document.getElementById('contact').value.trim(),
            serviceType: document.getElementById('serviceType').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Validate form data
        if (!formData.name || !formData.contact || !formData.serviceType || !formData.message) {
            showFormStatus('Please fill in all fields.', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
        
        try {
            // Send to Discord webhook
            const discordPayload = {
                embeds: [{
                    title: "🚀 New Service Request",
                    color: 0x6366f1,
                    fields: [
                        {
                            name: "👤 Name",
                            value: formData.name,
                            inline: true
                        },
                        {
                            name: "📞 Contact",
                            value: formData.contact,
                            inline: true
                        },
                        {
                            name: "🛠️ Service Type",
                            value: formData.serviceType,
                            inline: true
                        },
                        {
                            name: "💬 Project Details",
                            value: formData.message,
                            inline: false
                        }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "MineCloud Service Request"
                    }
                }]
            };
            
            const response = await fetch('https://discord.com/api/webhooks/1398594915096723537/JWnASMCPUwI6Eu5xcGihIMTYxAMbiWV3eFAe_anbSCinobSmKybUlmmMQHpkStLU5H8U', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discordPayload)
            });
            
            if (response.ok) {
                // Success
                showFormStatus('✅ Your request has been sent!', 'success');
                form.reset(); // Clear the form
                
                // Track the service inquiry in analytics
                trackServiceInquiry(formData);
            } else {
                throw new Error('Discord webhook failed');
            }
            
        } catch (error) {
            console.error('Error sending service request:', error);
            showFormStatus('❌ Failed to send. Try again later.', 'error');
        }
        
        // Re-enable form
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    });
}

function showFormStatus(message, type) {
    const statusDiv = document.getElementById('form-status');
    statusDiv.textContent = message;
    statusDiv.className = `form-status ${type}`;
    statusDiv.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Track service inquiry in analytics (optional)
async function trackServiceInquiry(formData) {
    try {
        await fetch('http://localhost:3001/api/service-inquiry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serviceType: formData.serviceType,
                message: formData.message,
                contactEmail: formData.contact,
                status: 'pending'
            })
        });
    } catch (error) {
        console.log('Analytics tracking unavailable');
    }
}
