// ==========================================
// 1. BANCO DE DADOS DE QUESTÕES (3 BLOCOS DE 10)
// ==========================================
const niveisEducacionais = {
    1: [
        {
            pergunta: "O que a palha seca jogada sobre a horta ou lavoura faz pelo solo?",
            opcoes: [
                "Esquenta a terra até queimar a raiz",
                "Funciona como um cobertor, guardando a umidade da água",
                "Impede que o adubo faça efeito",
                "Serve apenas para juntar insetos ruins"
            ],
            correta: 1,
            materialId: "cartilha-solo",
            dica: "Dica: A palha protege o solo contra o sol forte e evita que a água evapore rápido."
        },
        // Complete aqui com as outras 9 questões do Bloco 1...
    ],
    2: [
        {
            pergunta: "Qual a forma correta de proteger uma mina d'água (nascente)?",
            opcoes: [
                "Deixar os animais beberem água direto na fonte",
                "Desmatar ao redor para o sol entrar",
                "Fazer o cercamento correto e manter a mata ciliar",
                "Canalizar toda a água com cimento"
            ],
            correta: 2,
            materialId: "video-minas",
            dica: "Dica: Veja a videoaula sobre recuperação de minas na aba Materiais de Apoio!"
        },
        // Complete aqui com as outras 9 questões do Bloco 2...
    ],
    3: [
        {
            pergunta: "Questão exemplo do Bloco 3 (Avançado)",
            opcoes: ["Opção A", "Opção B", "Opção C", "Opção D"],
            correta: 0,
            materialId: "cartilha-solo",
            dica: "Dica do nível avançado."
        }
        // Complete aqui com as outras 9 questões do Bloco 3...
    ]
};


// ==========================================
// 2. ESTADO GLOBAL DO SISTEMA
// ==========================================
let alunoLogado = null;
let nivelAtual = 1;
let questaoAtualIndice = 0;
let acertosNoBloco = 0;


// ==========================================
// 3. CONTROLE DE ACESSO (ÁREA DO ALUNO)
// ==========================================
function cadastrarAluno(nome, email, senha) {
    let usuarios = JSON.parse(localStorage.getItem('usuariosRaizes')) || [];
    if (usuarios.find(u => u.email === email)) {
        alert("Este e-mail já está cadastrado!");
        return false;
    }
    const novoAluno = {
        nome: nome,
        email: email,
        senha: senha,
        progresso: { nivelMaximoDesbloqueado: 1, historicoNotas: [] }
    };
    usuarios.push(novoAluno);
    localStorage.setItem('usuariosRaizes', JSON.stringify(usuarios));
    alert("Conta criada com sucesso! Entre na aba de Login.");
    return true;
}


function loginAluno(email, senha) {
    let usuarios = JSON.parse(localStorage.getItem('usuariosRaizes')) || [];
    let usuarioFiltrado = usuarios.find(u => u.email === email && u.senha === senha);


    if (usuarioFiltrado) {
        alunoLogado = usuarioFiltrado;
        nivelAtual = alunoLogado.progresso.nivelMaximoDesbloqueado;
        alert(`Bem-vindo, ${alunoLogado.nome}!`);
       
        // Esconde a tela de login e mostra o painel do aluno
        document.getElementById("area-login").style.display = "none";
        document.getElementById("painel-estudos").style.display = "block";
       
        carregarQuestao();
        atualizarTelasDeProgressoERelatorio();
        return true;
    } else {
        alert("E-mail ou senha incorretos.");
        return false;
    }
}


// ==========================================
// 4. MECANISMO DO QUIZ
// ==========================================
function carregarQuestao() {
    const listaDeQuestoes = niveisEducacionais[nivelAtual];
   
    if (questaoAtualIndice >= listaDeQuestoes.length) {
        finalizarBloco();
        return;
    }


    const questao = listaDeQuestoes[questaoAtualIndice];
    document.getElementById("texto-pergunta").innerText = questao.pergunta;


    const containerOpcoes = document.getElementById("container-opcoes");
    containerOpcoes.innerHTML = "";


    questao.opcoes.forEach((opcao, index) => {
        containerOpcoes.innerHTML += `
            <label class="opcao-resposta" style="display:block; margin: 10px 0; cursor:pointer;">
                <input type="radio" name="resposta-quiz" value="${index}">
                ${opcao}
            </label>
        `;
    });


    // Configura o botão de ajuda para linkar com a matéria de apoio
    const botaoApoio = document.getElementById("btn-consultar-apoio");
    if(botaoApoio) {
        botaoApoio.onclick = function() {
            alert(`${questao.dica}`);
        };
    }
}


function verificarResposta() {
    const listaDeQuestoes = niveisEducacionais[nivelAtual];
    const questao = listaDeQuestoes[questaoAtualIndice];
    const respostaSelecionada = document.querySelector('input[name="resposta-quiz"]:checked');


    if (!respostaSelecionada) {
        alert("Por favor, selecione uma resposta antes de avançar!");
        return;
    }


    if (parseInt(respostaSelecionada.value) === questao.correta) {
        acertosNoBloco++;
    }


    questaoAtualIndice++;
    carregarQuestao();
}


function finalizarBloco() {
    alert(`Bloco ${nivelAtual} concluído! Você acertou ${acertosNoBloco} de 10.`);


    alunoLogado.progresso.historicoNotas.push({
        bloco: nivelAtual,
        acertos: acertosNoBloco,
        data: new Date().toLocaleDateString()
    });


    if (acertosNoBloco >= 7) {
        if (nivelAtual < 3) {
            nivelAtual++;
            alunoLogado.progresso.nivelMaximoDesbloqueado = nivelAtual;
            alert(`🎉 Excelente! Você desbloqueou o Bloco ${nivelAtual}!`);
        } else {
            alert("🏆 Incrível! Você completou a trilha do Agrinho 2026!");
        }
    } else {
        alert("Você não alcançou os 70% de acertos (7 questões). Estude o Material de Apoio e tente novamente!");
    }


    atualizarDadosNoLocalStorage();
    questaoAtualIndice = 0;
    acertosNoBloco = 0;
   
    carregarQuestao();
    atualizarTelasDeProgressoERelatorio();
}


// ==========================================
// 5. PROGRESSO E RELATÓRIOS
// ==========================================
function atualizarTelasDeProgressoERelatorio() {
    if (!alunoLogado) return;


    // Atualiza o indicador visual de nível
    const textoNivel = document.getElementById("info-nivel-atual");
    if(textoNivel) textoNivel.innerText = `Bloco Atual: ${nivelAtual} de 3`;


    // Atualiza a tabela na aba "Relatórios"
    const tabelaCorpo = document.getElementById("corpo-tabela-relatorios");
    if (tabelaCorpo) {
        tabelaCorpo.innerHTML = "";
        alunoLogado.progresso.historicoNotas.forEach(nota => {
            tabelaCorpo.innerHTML += `
                <tr>
                    <td>${nota.data}</td>
                    <td>Bloco ${nota.bloco}</td>
                    <td>${nota.acertos}/10</td>
                    <td><strong>${nota.acertos >= 7 ? 'Aprovado' : 'Revisar Conteúdo'}</strong></td>
                </tr>
            `;
        });
    }
}


function atualizarDadosNoLocalStorage() {
    let usuarios = JSON.parse(localStorage.getItem('usuariosRaizes')) || [];
    let idx = usuarios.findIndex(u => u.email === alunoLogado.email);
    if (idx !== -1) {
        usuarios[idx] = alunoLogado;
        localStorage.setItem('usuariosRaizes', JSON.stringify(usuarios));
    }
}
