# Inteligência Pragmática

Um manual de bolso para ver o que é, decidir sem drama e fazer o que funciona.

**Ler agora:** https://alexmiromi.github.io/inteligencia-pragmatica/

## O que tem

- 15 capítulos curtos (8 a 9 minutos cada), mais abertura, kit de bolso e tabelas de consulta
- Tabelas, caixas de ideia central, armadilhas, exemplos e 47 gatilhos no formato "se X, então Y"
- Barra de leitura, tempo restante, check de capítulo lido, progresso geral
- Estrela nos gatilhos: os favoritos aparecem na capa, em "Meus gatilhos"
- Modo claro e escuro, tamanho de letra ajustável
- Funciona sem internet depois da primeira abertura (PWA)

## Instalar como app no celular

- **iPhone (Safari):** abra o link, toque em Compartilhar, depois "Adicionar à Tela de Início".
- **Android (Chrome):** abra o link, menu de três pontos, depois "Instalar app".

O progresso fica salvo só no aparelho (localStorage). Nada é enviado pra servidor nenhum.

## Editar o livro

```
chapters/NN-slug.html   um fragmento HTML por capítulo
src/book.json           sumário (ordem, títulos, partes)
src/shell.html          o app (layout, tema, progresso)
src/SPEC.md             regras de voz e componentes
python3 build.py        junta tudo em index.html e carimba o cache do sw.js
```

Depois de editar: `python3 build.py`, commit e push na `main`. O GitHub Pages publica sozinho.

## Sobre o texto

Texto original, escrito com IA e revisado. Os conceitos são creditados aos autores citados em cada capítulo
(Sternberg, Kahneman, Simon, Klein, Munger, Gollwitzer, Tetlock, Annie Duke, entre outros). Exemplos são hipotéticos.
