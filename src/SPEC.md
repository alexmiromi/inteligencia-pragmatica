# SPEC de escrita — livro "Inteligência Pragmática"

Livro original em pt-BR, lido no celular como PWA. Cada capítulo é um FRAGMENTO HTML em `chapters/NN-slug.html`
(sem `<html>`, `<head>`, `<body>`, sem `<h1>`; o título vem do shell). Um script junta tudo no `index.html`.

## Leitor
Empreendedor brasileiro, dono de e-commerce, pai, toca muitos projetos ao mesmo tempo, técnico o bastante.
Quer ferramenta mental que use amanhã cedo, não teoria bonita.

## Regras de voz
- Português brasileiro, direto, informal, "você". Frases curtas. Parágrafos de 2 a 4 linhas (tela de celular).
- ZERO travessão (—) e zero meia-risca (–) como pontuação. Use ponto, vírgula, dois-pontos ou parênteses.
- Sem cara de IA: nada de "em um mundo cada vez mais", "vale ressaltar", "é importante notar", "mergulhar",
  "jornada", "desbloquear", "no fim das contas", listas de três adjetivos, perguntas retóricas em série.
- Sem autoajuda melosa, sem puxa-saquismo com o leitor. Pode ser seco. Pode ter humor leve.
- Exemplos concretos: loja online, estoque, fornecedor, anúncio, funcionário, família, dinheiro pessoal, saúde.
- REPO É PÚBLICO: nada de nome real de empresa, pessoa, valores ou dados do leitor. Exemplos genéricos e inventados,
  claramente hipotéticos ("imagine uma loja que...").

## Regras de honestidade
- Só cite autor/estudo/conceito que você tem certeza que existe e está atribuído certo.
  Seguros: Sternberg (inteligência prática), Peirce/James/Dewey (pragmatismo), Kahneman e Tversky, Herbert Simon
  (racionalidade limitada, satisficing), Gigerenzer (heurísticas), Gary Klein (pré-mortem), Munger (inversão),
  Bezos (portas de uma/duas vias, decidir com ~70% da informação), Tetlock (superprevisores), Annie Duke (resulting),
  Gollwitzer (intenções de implementação se-então), Boyd (OODA), Pareto, lei de Parkinson, Gawande (checklists),
  Fisher e Ury (interesses x posições), navalha de Hanlon, matriz de Eisenhower, Taleb (via negativa), 5 porquês (Toyota),
  Korzybski (mapa não é território), Goodhart (lei de Goodhart), Hofstadter (lei de Hofstadter), Chesterton (cerca).
- NÃO invente números, percentuais, datas de estudo nem citações literais. Citação em `<blockquote>` só se tiver certeza
  do texto; na dúvida, parafraseie sem aspas ("Munger gostava de dizer que...").
- Achado científico contestado (ego depletion, juízes e fome, 21 dias pra hábito, 10 mil horas): ou não usa, ou avisa que é contestado.
- Quando for opinião do livro e não fato, deixe claro ("minha leitura:", "regra de bolso, não ciência:").

## Tamanho e estrutura de cada capítulo
- 1100 a 1500 palavras.
- Abre com `<p class="lead">` (gancho: cena concreta ou afirmação incômoda, 2-3 frases).
- 3 a 5 seções `<h2>`. Pode usar `<h3>` com parcimônia.
- Obrigatório por capítulo: pelo menos 1 tabela, 2 a 3 caixas `trigger`, 1 caixa `warn`, 1 caixa `ex`, 1 caixa `key`.
  Caixa `ask` é opcional.
- Fecha com `<section class="recap">`.
- Não repita assunto de outro capítulo (veja o sumário abaixo); pode referenciar ("como vimos no capítulo 4").

## Componentes (use EXATAMENTE este HTML; sem classes novas, sem style inline, sem div aninhada dentro de caixa)

```html
<p class="lead">Gancho.</p>

<h2>Título de seção</h2>
<p>Texto com <strong>negrito</strong> pra termo-chave e <em>itálico</em> raro.</p>

<div class="box key"><span class="box-t">Ideia central</span><p>Uma ideia, 1 a 3 frases.</p></div>

<div class="box trigger"><span class="box-t">Gatilho</span><p><b>Se</b> situação concreta e reconhecível, <b>então</b> ação física e específica.</p></div>

<div class="box warn"><span class="box-t">Armadilha</span><p>Como essa ideia dá errado quando mal usada.</p></div>

<div class="box ex"><span class="box-t">Na prática</span><p>Exemplo hipotético concreto.</p></div>

<div class="box ask"><span class="box-t">Pergunte-se</span><ul><li>Pergunta 1</li><li>Pergunta 2</li></ul></div>

<div class="table-wrap"><table>
<thead><tr><th>Coluna</th><th>Coluna</th></tr></thead>
<tbody><tr><td>célula curta</td><td>célula curta</td></tr></tbody>
</table></div>

<blockquote><p>Só se tiver certeza do texto.</p><cite>Autor</cite></blockquote>

<section class="recap">
<h2>Fechamento</h2>
<h3>Em 3 linhas</h3>
<ol><li>…</li><li>…</li><li>…</li></ol>
<h3>Exercício de 5 minutos</h3>
<p>Uma tarefa que dá pra fazer agora, com papel ou bloco de notas.</p>
</section>
```

Regras dos componentes:
- Caixa `trigger`: UM único `<p>`, sempre no formato **Se** …, **então** …. A ação tem que ser observável
  ("abro o bloco de notas e escrevo X", "pergunto Y em voz alta", "espero 24h"), nunca "reflito melhor".
  O script de build coleta todos os gatilhos pro capítulo final, então capricha: cada um tem que fazer sentido sozinho.
- Tabelas: no máximo 3 colunas, células curtas (cabe em celular). Tabela tem que ser útil de consultar depois
  (comparação, diagnóstico, antídoto), não enfeite.
- Listas `<ul>`/`<ol>` normais são permitidas no texto.
- Escape `&` como `&amp;`. Aspas normais. Sem emoji.

## Sumário do livro (pra não sobrepor)

Parte I, Fundamento
- 00 Como usar este livro
- 01 O que é inteligência pragmática: Sternberg (analítica x criativa x prática), pragmatismo filosófico (ideia vale pelo que produz),
  ser inteligente x ser eficaz, as 4 perguntas pragmáticas (o que é verdade aqui? o que eu quero? o que está sob meu controle? qual o próximo passo?).
  Tabela: inteligência de prova x inteligência pragmática.
- 02 Fato, suposição e opinião: mapa x território, como separar os três, ir olhar o dado na fonte, lei de Goodhart (métrica vira alvo e estraga),
  "quão certo estou, de 0 a 100?". Tabela: fato/suposição/opinião com exemplo e teste.

Parte II, Pensar
- 03 Qual é o problema de verdade?: apaixonar-se pela solução, sintoma x causa, 5 porquês (e o limite deles), escrever o problema em uma frase,
  "o que acontece se eu não fizer nada?", cerca de Chesterton. Tabela: sintoma → pergunta → causa provável.
- 04 Os vieses que custam dinheiro: Sistema 1 e 2, os 6 vieses mais caros pra quem decide (confirmação, ancoragem, disponibilidade,
  excesso de confiança, aversão à perda, falácia do planejamento + lei de Hofstadter). Tabela: viés → como aparece → antídoto.
  NÃO tratar custo afundado aqui (é do cap 09).
- 05 Taxa-base e apostas: pensar em probabilidade, visão de fora x visão de dentro, taxa-base, valor esperado simples com conta de padaria,
  Tetlock (previsão em números, atualizar aos poucos), tamanho da aposta (nunca apostar o que quebra você). Tabela: palavra vaga → faixa de probabilidade que você quer dizer.
- 06 Inversão e pré-mortem: Munger (inverter: como garantir o fracasso?), Klein (pré-mortem passo a passo), via negativa (tirar antes de pôr),
  lista de "erros burros" a evitar. Tabela: objetivo → inversão → o que evitar.

Parte III, Decidir
- 07 Portas de uma via e de duas vias: reversibilidade, velocidade de decisão, ~70% da informação, quem decide, custo de esperar,
  como transformar porta de uma via em duas (piloto, contrato curto, backup). Tabela: tipo de decisão → velocidade → quem → exemplo.
- 08 Bom o suficiente: Simon e satisficing, maximizador x satisficer, Pareto, lei de Parkinson, definir critério de "pronto" antes de começar,
  quando o perfeccionismo É o certo (segurança, dinheiro, irreversível). Tabela: onde caprichar x onde soltar.
- 09 Custo de oportunidade e custo afundado: todo sim é um não pra outra coisa, custo afundado, critérios de morte definidos antes ("kill criteria"),
  matar projeto sem drama, o teste "se eu começasse hoje, entraria nisso?". Tabela: sinais de que é hora de matar x sinais de que é só o vale do meio.

Parte IV, Fazer
- 10 O menor teste que ensina algo: experimento barato, hipótese escrita antes, OODA, ciclo de feedback curto, o que medir, quando parar de testar e escalar.
  Tabela: ideia grande → menor teste → o que aprende → custo.
- 11 Gatilhos se-então: Gollwitzer (intenções de implementação), por que força de vontade é plano ruim, anatomia de um bom gatilho (deixa + ação),
  desenhar o ambiente (atrito a favor), empilhar em rotina existente, gatilhos de parada (quando NÃO agir: e-mail com raiva, compra por impulso).
  Tabela: gatilho ruim x gatilho bom. Este capítulo pode ter 4 caixas trigger.
- 12 Uma coisa de cada vez: custo de alternar contexto, limite de trabalho em andamento (WIP), matriz de Eisenhower, lista "não fazer",
  projeto estacionado não é projeto abandonado, bloco de foco. Tabela: matriz de Eisenhower com exemplos de dono de negócio.
- 13 Checklists, rotinas e energia: Gawande (checklist pra erro burro, não pra burrice), decisão importante na hora boa do dia (regra de bolso),
  sono como ferramenta de decisão (sem números inventados), rotina que elimina microdecisão, revisão semanal de 30 min.
  Tabela: roteiro da revisão semanal (pergunta → tempo).

Parte V, Sustentar
- 14 Pragmatismo com gente: interesses x posições (Fisher e Ury), navalha de Hanlon, delegar resultado e não tarefa, combinado claro
  (quem, o quê, até quando, como sei que ficou pronto), conversa difícil curta, dizer não sem queimar ponte. Tabela: frase vaga → frase pragmática.
- 15 Diário de decisões: Annie Duke (resulting: julgar decisão pelo resultado), separar qualidade da decisão x sorte, modelo de registro de decisão,
  revisão pós-ação (o que esperava, o que aconteceu, por quê, o que muda), calibragem. Tabela: matriz decisão boa/ruim x resultado bom/ruim.
- 16 Kit de bolso (gerado pelo build + texto do autor).
