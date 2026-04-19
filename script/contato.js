document.addEventListener('DOMContentLoaded', () => {
    // Selecionamos os elementos que queremos animar
    const elementsToAnimate = document.querySelectorAll('.info-card, .map-section, .contact-section, .hero-content');

    // Configuração do Observador
    const observerOptions = {
        threshold: 0.1 // Dispara quando 10% do elemento está visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adiciona a classe que inicia a animação
                entry.target.classList.add('animate-in');
                // Para de observar após animar uma vez
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementsToAnimate.forEach(el => {
        // Adiciona a classe inicial de "escondido"
        el.classList.add('hidden-state');
        observer.observe(el);
    });
});



//mascara telefone:
const tel = document.getElementById('telefone');

tel.addEventListener('keypress', (e) => {
    let inputLength = tel.value.length;

    // Impede a digitação de letras
    if (!/\d/.test(e.key)) {
        e.preventDefault();
    }
});

tel.addEventListener('input', () => {
    let value = tel.value.replace(/\D/g, ''); // Remove tudo que não é número
    let formattedValue = '';

    if (value.length > 0) {
        formattedValue = '(' + value.substring(0, 2);
        if (value.length > 2) {
            formattedValue += ') ' + value.substring(2, 7);
        }
        if (value.length > 7) {
            formattedValue += '-' + value.substring(7, 11);
        }
    }

    tel.value = formattedValue;
});