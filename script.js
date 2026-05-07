document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('invoice-form');

    // Inputs
    const companyName = document.getElementById('companyName');
    const clientName = document.getElementById('clientName');
    const phoneNumber = document.getElementById('phoneNumber');
    const theme = document.getElementById('theme');
    const sessionDate = document.getElementById('sessionDate');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const serviceType = document.getElementById('serviceType');
    const duration = document.getElementById('duration');
    const advancePaid = document.getElementById('advancePaid');

    // Edit Rates
    const btnEditRates = document.getElementById('btn-edit-rates');
    const ratesEditor = document.getElementById('rates-editor');
    const rateInputs = [
        document.getElementById('ratePhoto30m'),
        document.getElementById('ratePhoto1h'),
        document.getElementById('ratePhoto2h'),
        document.getElementById('rateRental1h')
    ];

    // Actions
    const btnDownload = document.getElementById('btn-download');
    const btnWhatsapp = document.getElementById('btn-whatsapp');

    // Logo
    const invLogo = document.getElementById('inv-logo');

    // Invoice Preview Elements
    const invCompanyName = document.getElementById('inv-company-name');
    const invCurrentDate = document.getElementById('inv-current-date');
    const invNumber = document.getElementById('inv-number');
    const invClientName = document.getElementById('inv-client-name');
    const invPhone = document.getElementById('inv-phone');
    const invTheme = document.getElementById('inv-theme');
    const invSessionDate = document.getElementById('inv-session-date');
    const invTimeSlot = document.getElementById('inv-time-slot');
    const invServiceType = document.getElementById('inv-service-type');
    const invDuration = document.getElementById('inv-duration');
    const invAmount = document.getElementById('inv-amount');
    const invTotal = document.getElementById('inv-total');
    const invAdvance = document.getElementById('inv-advance');
    const invBalance = document.getElementById('inv-balance');

    // --- State Initialization ---
    // Generate Invoice Number
    const generateInvoiceNumber = () => {
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        return `INV-${datePart}-${randomPart}`;
    };

    invNumber.textContent = generateInvoiceNumber();

    // Set current date
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    invCurrentDate.textContent = today;

    // Set today as default session date
    sessionDate.valueAsDate = new Date();

    // --- Logic & Updates ---

    // Toggle Edit Rates
    btnEditRates.addEventListener('click', () => {
        ratesEditor.classList.toggle('hidden');
        btnEditRates.textContent = ratesEditor.classList.contains('hidden') ? 'Edit Rates' : 'Close Rates';
    });



    const getRates = () => {
        return {
            photo: {
                '30m': Number(document.getElementById('ratePhoto30m').value) || 0,
                '1h': Number(document.getElementById('ratePhoto1h').value) || 0,
                '2h': Number(document.getElementById('ratePhoto2h').value) || 0
            },
            rental: Number(document.getElementById('rateRental1h').value) || 0
        };
    };

    const updateDurationOptions = () => {
        const type = serviceType.value;
        duration.innerHTML = '';

        if (type === 'photography') {
            const options = [
                { value: '30m', label: '30 Minutes' },
                { value: '1h', label: '1 Hour' },
                { value: '2h', label: '2 Hours' }
            ];
            options.forEach(opt => {
                duration.add(new Option(opt.label, opt.value));
            });
        } else if (type === 'rental') {
            for (let i = 1; i <= 12; i++) {
                duration.add(new Option(`${i} Hour${i > 1 ? 's' : ''}`, `${i}h`));
            }
        }
        updatePreview();
    };

    const calculateTotals = () => {
        const type = serviceType.value;
        const dur = duration.value;
        const rates = getRates();
        let total = 0;

        if (type === 'photography') {
            total = rates.photo[dur] || 0;
        } else if (type === 'rental') {
            const hours = parseInt(dur);
            total = rates.rental * hours;
        }

        const advance = Number(advancePaid.value) || 0;
        const balance = total - advance;

        return { total, advance, balance };
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTimeSlot = (start, end) => {
        if (!start && !end) return '-';

        const formatTime = (timeString) => {
            if (!timeString) return '';
            const [h, m] = timeString.split(':');
            const date = new Date();
            date.setHours(h, m);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        };

        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const updatePreview = () => {
        // Text Info
        if (invCompanyName) {
            invCompanyName.textContent = companyName.value || 'Your Studio';
        }
        invClientName.textContent = clientName.value || 'Client Name';
        invPhone.textContent = phoneNumber.value || 'Phone Number';
        invTheme.textContent = theme.value || '-';
        invSessionDate.textContent = formatDate(sessionDate.value);
        invTimeSlot.textContent = formatTimeSlot(startTime.value, endTime.value);

        // Service Info
        invServiceType.textContent = serviceType.value === 'photography' ? 'Photography Session' : 'Studio Rental';
        invDuration.textContent = duration.options[duration.selectedIndex]?.text || '-';

        // Calculation
        const { total, advance, balance } = calculateTotals();

        invAmount.textContent = formatCurrency(total);
        invTotal.textContent = formatCurrency(total);
        invAdvance.textContent = formatCurrency(advance);
        invBalance.textContent = formatCurrency(balance);
    };

    // --- Event Listeners ---
    serviceType.addEventListener('change', updateDurationOptions);

    // Attach updatePreview to all form inputs
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Also update when rates are edited
    rateInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Initial Setup
    updateDurationOptions();
    updatePreview();

    // --- Actions ---

    // Download PDF
    btnDownload.addEventListener('click', () => {
        const element = document.getElementById('invoice-document');
        const filename = `Invoice_${invClientName.textContent.replace(/[^a-z0-9]/gi, '_')}.pdf`;

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Add a slight loading indication
        btnDownload.innerHTML = 'Generating...';
        btnDownload.disabled = true;

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore button
            btnDownload.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
            `;
            btnDownload.disabled = false;
        });
    });

    // WhatsApp Share
    btnWhatsapp.addEventListener('click', () => {
        const phone = phoneNumber.value.replace(/[^0-9+]/g, '');
        if (!phone) {
            alert('Please enter a WhatsApp number.');
            phoneNumber.focus();
            return;
        }

        const client = clientName.value || 'Client';
        const projectTheme = theme.value || 'your session';
        const { total, advance, balance } = calculateTotals();

        const message = `Hi ${client}, your session for ${projectTheme} is confirmed. \n\nTotal: ₹${total}\nAdvance Paid: ₹${advance}\nBalance: ₹${balance}\n\nLooking forward to it!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    });
});
