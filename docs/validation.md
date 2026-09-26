# Validação e inconsistências

## Séries parciais

- 2022: apenas janeiro em consumo, economias, rede, ligações e produção/distribuição dos PDFs históricos.
- 2019: vazão do Rio Piracicaba disponível de janeiro a outubro.
- 2022: precipitação contém apenas janeiro.

## Produção e distribuição

O CSV mantém os números da fonte e adiciona `quality_flag`.

- 2010: a fonte apresenta total distribuído superior ao produzido.
- 2019: os totais anuais não são compatíveis com a média mensal multiplicada por 12.
- 2022: além de parcial, média mensal e total de janeiro não coincidem.

Nenhum desses valores foi ajustado.

## População

A base SEADE foi mantida exatamente como publicada. Há linhas em que a soma das faixas não coincide com o total. A diferença é calculada no próprio CSV para auditoria.

## Perdas em 2023

O PMSB 2026 reporta 55,40% em um trecho (página PDF 157) e 54,50% em outro (página PDF 242). Os dois registros são mantidos em arquivo separado. O carrossel usa 2022 (53,93%), que está na série tabular SNIS.
