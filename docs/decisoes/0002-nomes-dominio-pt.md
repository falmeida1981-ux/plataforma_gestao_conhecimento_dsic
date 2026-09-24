# ADR 0002 — Nomes do domínio em português no código

- **Estado:** aceite
- **Data:** 2026-09-24

## Contexto

Os requisitos, os utilizadores e a interface estão em português de Portugal. Traduzir os conceitos para inglês (intervenção → change, ocorrência → incident) obrigaria a um glossário e a traduções ambíguas: "intervenção" não é exatamente um "change" do ITIL, e "registo de atividade" não tem tradução direta.

## Decisão

- Modelos, campos, funções e variáveis do domínio em português, **sem acentos**: `Intervencao`, `Ocorrencia`, `RegistoAtividade`, `calcularImpacto`.
- Tabelas e colunas em snake_case (`registo_atividade`, `atualizado_em`) através de `@@map`/`@map`.
- Código técnico genérico (utilitários, configuração, bibliotecas) pode ficar em inglês.

## Consequências

- O código corresponde 1:1 ao documento de requisitos, o que facilita a revisão e o trabalho com o Claude Code.
- Mistura de línguas nas fronteiras com bibliotecas; é aceite.
