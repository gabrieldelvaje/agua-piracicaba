# Nota sobre a revisão editorial

A página foi encurtada em 01/10/2026: concentra-se no projeto Corumbataí e em seu papel no abastecimento. A digitalização do Estadão foi retirada da página e das fontes clicáveis; conserva-se apenas a manchete e a referência. Os tópicos de tratamento, produção e chuva abaixo são pesquisa de apoio da versão anterior, não seções publicadas na versão atual.

# Evidências e decisões editoriais

## Pesquisa realizada

Foram examinados o pacote de fontes anexado, o código dos episódios 1 e 2, os CSVs existentes, a imprensa já disponível no repositório e novas fontes públicas. O ZIP anexo contém fichas e links, não cópias dos documentos originais; suas sínteses não foram tratadas como validação final. Consultaram-se os documentos apontados e fontes adicionais de Câmara, Semae, Prefeitura, USP, Consórcio PCJ e Jornal de Piracicaba.

Consultas de descoberta incluíram: `Piracicaba Corumbataí captação 1982 história abastecimento`, `Corumbataí Piracicaba 1973 1982`, `Capim Fino inauguração 1982 jornal`, `Corumbataí 1979 Piracicaba captação jornal`, `Capim Fino ampliação 2026` e `Piracicaba 44% chuva 2024`. As URLs e localizadores efetivamente usados estão em `data/episodio-3/fontes.json`.

## Matriz de afirmações

| Afirmação | Evidência | Decisão |
|---|---|---|
| Preparação em 1973; obras em 1979; conclusão em maio de 1982 | Câmara, retrospectiva do Projeto Corumbataí | Atribuir à retrospectiva, cruzando 1982 com PMSB p. PDF 61 |
| Comprometimento da qualidade menor no Corumbataí | PMSB p. PDF 29, impressa 20 | Qualidade relativa de água bruta; não significa potabilidade |
| ETA III entra em 1982, inicialmente cerca de 33% | PMSB p. PDF 61, impressa 52 | Dado aproximado de participação da estação; não plotar junto com percentuais dos rios |
| Tentativa de abastecimento concentrado em 2000 não se sustentou | PMSB p. PDF 73, impressa 64 | Cerca de seis meses; limitações acima de 1.330 L/s segundo retrospectiva do plano |
| Corumbataí fornece também mistura para ETAs centrais | PMSB pp. PDF 61 e 73 | Explicação central; diagnóstico refere continuidade em 2023 |
| ETA III produz 65,38% em 2022 | PMSB Tabela 14, p. PDF 103 | Conferido por recálculo e soma |
| Capim Fino quase no limite no diagnóstico | Tabela 16 e texto, p. PDF 104 | Razão adução média/capacidade, não ocupação horária medida |
| 90% em 2006 e 80% em 2024 | Comunicados datados | Retratos com descrições distintas, sem linha de tendência |
| Chuva caiu 56,09% | Prefeitura 27/09/2024, posto Paulista | Jan–ago contra jan–ago; não chuva espacial da bacia |
| Vazão 1,63 m³/s e captação 1.453 L/s em 27/09/2024 | Mesmo comunicado | Não dividir para estimar fração do rio retirada; posto/intervalo não explicitados |
| Ampliação para até 2.000 L/s entregue em 28/08/2026 | Consórcio PCJ | Atualização posterior ao diagnóstico; capacidade, não produção medida |

## Imprensa histórica: o que foi efetivamente consultado

- **Estadão, 08/08/1979:** imagem já no repositório, lida visualmente. Manchete central sobre mobilização contra poluição; terceira coluna menciona abastecimento futuro pelo Corumbataí e cobra recuperação do Piracicaba. A página impressa é **30**, embora o arquivo esteja nomeado `p24`. O arquivo original foi preservado e a divergência é explicada na legenda. Não se renomeou o acervo para evitar quebrar os links do EP2.
- **O Diário, 07/11/1978:** referência e imagem em Martirani, PDF pp. 74–75, impressas 71–72, figura 32. Relacionada à contaminação da água consumida. Consulta indireta.
- **Jornal de Piracicaba, 15/07/1979:** referência e figura 30 em Martirani, PDF p. 74. Relacionada à crise do abastecimento. Consulta indireta.
- **A Tribuna Piracicabana, 03/03/2000:** figura 34 e legenda em Martirani, PDF p. 75. Anúncio de que o Piracicaba deixaria de abastecer a cidade. Tratar como anúncio; cruzar com retrospectiva operacional do PMSB. Consulta indireta.
- **Jornal de Piracicaba, 28/01/2024, André Thieful:** página original no Sampi. Debate de alternativa no Tietê após interrupção da captação; proposta em estudo.

Não foram criadas falsas digitalizações, atribuídas páginas desconhecidas aos jornais citados na tese, ou usadas fotografias de 2021 como registros de 1982. As referências indiretas têm links para a página exata do PDF. Para aprofundamento de acervo: buscar os exemplares integrais de 1978, 1979 e 2000 e a cobertura de inauguração de maio de 1982 na Biblioteca Municipal, IHGP e jornais; essa lacuna não impede publicar os achados já documentados, desde que a mediação da tese permaneça explícita.

## Qualidade dos dados

A soma das unidades da Tabela 14 é 70.719.256 m³. O texto corrido acima informa 70.719.257 m³: diferença de 1 m³. O episódio adota a tabela e documenta a divergência. As participações arredondadas podem não somar exatamente 100%.

O documento publicado em 2026 contém várias camadas temporais. O esquema corresponde ao diagnóstico com referência a 2023; as tabelas escolhidas são de 2022; trechos operacionais remontam a 2000 e 2010. A ampliação de 2026 aparece separadamente.

A fala em notícia da Câmara que coloca o Corumbataí fora da bacia PCJ foi descartada: trata-se de afluente integrante da bacia do Piracicaba. Um depoimento político não se sobrepõe à caracterização hidrográfica do PMSB.

Não foram estimados efeito causal do Cantareira na decisão, correlação chuva–captação, série de potabilidade ou participação atual em outubro de 2026. Faltam séries harmonizadas e medições comparáveis para essas conclusões. O episódio utiliza evidência documental para história e recortes explícitos para quantificação.

## Escopo preservado

Implementação limitada ao episódio 3 e a seus novos arquivos de pesquisa, dados, CSS e JS. Cabeçalho e hero compartilham o estilo existente da série. Rodapé contínuo, fontes centralizadas, cápsulas com diálogos, leitura mobile e respeito a movimento reduzido. Home já aponta para o episódio 3; não precisa mudar seu link.
