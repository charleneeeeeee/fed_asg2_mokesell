import { createVoucher, recordSpin, getLastSpin } from './api.js';
import { showToast, updateNavigation } from './utils.js';

// Wheel configuration
const prizes = [
    { text: '5% OFF', color: '#FF6B6B', angle: 0, discount: 5 },
    { text: '10% OFF', color: '#4ECDC4', angle: 45, discount: 10 },
    { text: 'Try Again', color: '#95A5A6', angle: 90, discount: 0 },
    { text: '15% OFF', color: '#45B7D1', angle: 135, discount: 15 },
    { text: '20% OFF', color: '#96CEB4', angle: 180, discount: 20 },
    { text: 'Try Again', color: '#95A5A6', angle: 225, discount: 0 },
    { text: '25% OFF', color: '#FFBE0B', angle: 270, discount: 25 },
    { text: 'Try Again', color: '#95A5A6', angle: 315, discount: 0 }
];

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Update navigation
    updateNavigation();

    // Create wheel sections
    createWheel();

    // Check if user can spin
    const spinButton = document.getElementById('spinButton');
    
    try {
        const lastSpin = await getLastSpin(user.username);
        
        if (lastSpin) {
            const lastSpinTime = new Date(lastSpin.spun_at).getTime();
            const timeSinceLastSpin = Date.now() - lastSpinTime;
            const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

            if (timeSinceLastSpin < cooldownPeriod) {
                spinButton.disabled = true;
                const timeLeft = new Date(cooldownPeriod - timeSinceLastSpin);
                const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                showToast(`You can spin again in ${hoursLeft}h ${minutesLeft}m`, 'info');
            }
        }
    } catch (error) {
        console.error('Error checking last spin:', error);
        showToast('Failed to check spin eligibility', 'error');
    }

    // Handle spin button click
    spinButton.addEventListener('click', spinWheel);
});

function createWheel() {
    const wheel = document.getElementById('wheel');
    const sectionAngle = 360 / prizes.length;

    prizes.forEach((prize, index) => {
        const section = document.createElement('div');
        section.className = 'wheel-section';
        section.style.transform = `rotate(${index * sectionAngle}deg)`;
        section.style.backgroundColor = prize.color;
        wheel.appendChild(section);
    });
}

function generateVoucherCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function spinWheel() {
    const user = JSON.parse(localStorage.getItem('user'));
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    
    // Disable spin button
    spinButton.disabled = true;

    try {
        // Record the spin in RestDB
        await recordSpin(user.username);

        // Random number of full rotations (3-5) plus random section
        const fullRotations = (Math.floor(Math.random() * 3) + 3) * 360;
        const randomPrize = Math.floor(Math.random() * prizes.length);
        const finalRotation = randomPrize * (360 / prizes.length);
        const totalRotation = fullRotations + finalRotation;

        // Spin the wheel
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        // After spin completes
        setTimeout(async () => {
            const prize = prizes[randomPrize];
            if (prize.text !== 'Try Again') {
                try {
                    // Create voucher in RestDB
                    const voucherData = {
                        code: generateVoucherCode(),
                        username: user.username,
                        discount: prize.discount
                    };

                    const newVoucher = await createVoucher(voucherData);

                    // Show winning modal
                    document.getElementById('prizeText').textContent = `You won ${prize.text}!`;
                    new bootstrap.Modal(document.getElementById('resultModal')).show();
                    
                    showToast('Voucher added to your account!', 'success');
                } catch (error) {
                    console.error('Error creating voucher:', error);
                    showToast('Failed to create voucher. Please try again.', 'error');
                }
            } else {
                showToast('Better luck next time!', 'info');
            }
        }, 4000);
    } catch (error) {
        console.error('Error recording spin:', error);
        showToast('Failed to process spin. Please try again.', 'error');
        spinButton.disabled = false;
    }
}