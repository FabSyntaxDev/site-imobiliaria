function selecionar(opcao) {
    // 1. Mapeia cada opção para uma URL específica baseada na sua estrutura de pastas
    const rotas = {
        'comprar': './AbaVenda/venda.html',
        'alugar':  './AbaAluguel/aluguel.html',
        'vender':  './vender.html' // Ajuste este se o arquivo vender.html estiver na raiz
    };

    const urlDestino = rotas[opcao];

    // 2. Log para debug (ajuda muito a ver se o clique funcionou)
    console.log("Opção selecionada:", opcao);
    console.log("Redirecionando para:", urlDestino);

    // 3. Executa o redirecionamento
    if (urlDestino) {
        window.location.href = urlDestino;
    } else {
        console.error("Erro: Rota não encontrada para a opção:", opcao);
    }
}

// Fim do topo