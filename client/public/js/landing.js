document.addEventListener('DOMContentLoaded', () => {
    // Add subtle parallax effect to background on mouse move
    const background = document.querySelector('.background-container');
    const content = document.querySelector('.content-wrapper');

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        // Move background slightly opposite to mouse
        background.style.transform = `scale(1.1) translate(-${x * 10}px, -${y * 10}px)`;
    });

    // Add click ripple effect (optional enhancement)
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mousedown', function (e) {
            let x = e.clientX - e.target.offsetLeft;
            let y = e.clientY - e.target.offsetTop;

            // Console log to verify interaction
            console.log(`Card clicked: ${this.querySelector('.card-title').innerText}`);
        });
    });
});
