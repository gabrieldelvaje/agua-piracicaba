# Organização de mídia do site

Os arquivos visuais do projeto seguem esta estrutura:

- `home/`: imagens da página inicial.
- `cards/`: thumbnails dos episódios na home.
- `episodes/episodio-X/hero/`: imagem principal do episódio.
- `episodes/episodio-X/timeline/`: imagens usadas em linhas do tempo.
- `episodes/episodio-X/media/`: fotografias e imagens editoriais do episódio.
- `episodes/episodio-X/diagrams/`: SVGs, esquemas e ilustrações.
- `episodes/episodio-X/documents/`: PDFs, scans e documentos históricos.
- `shared/`: mídia usada por mais de um episódio.

## Convenção de nomes

1. usar minúsculas e `kebab-case`;
2. evitar espaços, acentos e nomes genéricos como `image.png`;
3. para material histórico, começar pelo ano ou intervalo quando ele for conhecido;
4. incluir assunto e contexto no nome: `1979-praca-protesto-ecologico.png`;
5. não atribuir um ano à fotografia quando a imagem não for realmente daquele período;
6. manter créditos, fonte e contexto histórico no HTML ou na documentação, e não tentar colocar tudo no nome do arquivo.

Exemplos:

- `1950-1960-jk-refinadora-paulista.jpg`
- `1974-sistema-cantareira.jpg`
- `2024-rio-corumbatai-estiagem.avif`
- `decreto-2782-1979-praca-protesto-ecologico.pdf`
