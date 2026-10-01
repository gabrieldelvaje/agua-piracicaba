# Episódio 3 — Por que Piracicaba foi buscar água no Corumbataí?

Pesquisa e implementação: 01/10/2026. Página: `episodio-3.html`.

## Pergunta e argumento

A deterioração do rio Piracicaba aumentou a dificuldade de tratamento, enquanto o abastecimento precisava acompanhar a expansão urbana. O Corumbataí oferecia água bruta de melhor qualidade relativa e sustentou a expansão via ETA Capim Fino. A mudança foi gradual: preparação em 1973, obras em 1979, operação em 1982, tentativa de concentração em 2000 e retorno à operação combinada. O episódio conecta a crise ambiental do EP2 à proteção das margens e mananciais do EP4.

Não se atribui a decisão exclusivamente ao Cantareira. O levantamento de 1973 antecede sua operação inicial e o protesto de 1978. Também não se afirma que o Corumbataí esteja fora das bacias PCJ.

## Estrutura narrativa

1. História: tratar a água do Piracicaba se torna um problema, enquanto é preciso ampliar a oferta.
2. Linha do tempo: preparação, obras, inauguração, tentativa de 2000 e ampliação de 2026.
3. Sistema: Corumbataí → ETA III e interligação para ETAs I/II; Piracicaba → ETAs I/II. Esquema do diagnóstico, não telemetria.
4. Dados: produção anual por ETA (2022), retratos de participação do manancial (2006/2024), adução/capacidade (2022), chuva (jan–ago 2023/2024).
5. Jornais: página primária de 1979; referências documentais de 1978/1979/2000 via tese; debate de 2024.
6. Fechamento: ampliação entregue em agosto de 2026 e necessidade de proteção da bacia.
7. Fontes, metodologia e limitações em diálogos acessíveis.

## Arquivos e reprodução

Na raiz do repositório:

```bash
python src/episodio-3/reproduzir.py
```

A execução usa apenas Python padrão. Regenera `data/episodio-3/indicadores.json` a partir dos CSVs. Os dados foram transcritos manualmente e conferidos nas fontes; a reprodução dos cálculos é automática, a transcrição não. Os gráficos HTML são estáticos para permanecerem disponíveis sem JavaScript e devem ser atualizados ao alterar a base.

- `fontes.json`: URLs, datas, localizadores, usos e restrições de cada fonte.
- `manifesto.json`: URL e SHA-256 do PDF conferido, com correspondência de páginas.
- `producao_eta_2022.csv`: Tabela 14, PDF p. 103 / impressa 94.
- `aducao_eta_2022.csv`: Tabela 16 e texto adjacente, PDF p. 104 / impressa 95. O nome legado `vazao_media_ls` representa adução média no ano, não vazão do rio.
- `observacoes.csv`: observações pontuais de chuva, vazão, captação, capacidade e participação.
- `indicadores.json`: cálculos derivados.
- `pesquisa.md`: evidências, decisões editoriais e limitações.

Para conferir o PDF original, baixe a URL em `manifesto.json`, compare o SHA-256 e use `pdftotext -layout` (Poppler). Contagem PDF é a posição 1-based no arquivo, distinta da numeração impressa. Uma futura troca do PDF oficial pode alterar o hash; não sobrescreva silenciosamente a transcrição.

## Cálculos

- Produção por ETA: `volume_m3 / 70719256 * 100`.
- Adução média / capacidade: ETA III `1468.7 / 1500 * 100 = 97.91%`.
- Chuva: `(1 - 516.9 / 1177.2) * 100 = 56.09%` de redução.
- Ampliação: `(2000 / 1500 - 1) * 100 = 33.33%`.
- Equivalente teórico adicional: `(2000 - 1500) * 86400 / 1000000 = 43.2` milhões L/dia.

Os percentuais são arredondados apenas na apresentação. Não se calcula participação dos rios com volumes por ETA, nem uma série temporal entre estimativas pontuais de notícias. Não se deriva saldo de água no rio dividindo dados de captação por vazão sem compatibilizar postos e intervalos.
