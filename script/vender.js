let currentStep = 1;
const totalSteps = 6;

function nextStep() {
    const nomeInput = document.getElementById('nome');
    
    if (nomeInput.value.trim() === "") {
        alert("Por favor, digite seu nome para continuar.");
        return;
    }

    if (currentStep < totalSteps) {
        currentStep++;
        document.getElementById('step-text').innerText = `Passo ${currentStep}/${totalSteps}`;
        
        // Limpa o input para simular a próxima pergunta
        nomeInput.value = "";
        
        // Altera o label para simular progresso
        if(currentStep === 2) {
            document.querySelector('label[for="nome"] b').innerText = "E-mail";
            nomeInput.placeholder = "Digite seu melhor e-mail";
        }
        
        console.log("Avançando para o passo:", currentStep);
    } else {
        alert("Avaliação enviada com sucesso!");
    }
}