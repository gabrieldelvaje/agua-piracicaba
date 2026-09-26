# Metodologia

## 1. Conversão dos PDFs

As tabelas textuais dos PDFs foram extraídas preservando os valores publicados. Separadores de milhar brasileiros foram removidos na camada CSV e vírgulas decimais foram convertidas para ponto, permitindo leitura direta por Python, R, SQL e ferramentas de BI.

Valores indicados na fonte como indisponíveis (`***`) ou categorias que deixaram de existir (`****`) foram convertidos para campos vazios, sem imputação.

## 2. Períodos parciais

As linhas explicitamente identificadas como parciais nas fontes receberam `periodo_completo=false`. Isso inclui 2022 em várias séries históricas e 2019 na série de vazão do Rio Piracicaba.

## 3. Consumo por economia residencial

`consumo_medio_m3_por_economia_mes = consumo_residencial_anual_m3 / economias_residenciais / 12`

A análise termina em 2021 porque os valores de 2022 dos PDFs históricos são apenas de janeiro.

## 4. Perdas

Os índices de perda não são reconstruídos a partir das demais tabelas. O projeto usa a série oficial SNIS transcrita da Tabela 25 do PMSB 2026.

## 5. Validação

O repositório preserva divergências da fonte. `quality_flag` sinaliza problemas sem alterar os valores publicados.
