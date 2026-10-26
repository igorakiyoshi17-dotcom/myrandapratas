MYRANDA PRATAS — FOTOS NAS SELEÇÕES

Substitua no GitHub:
- admin.html
- script.js

Correções:
- Novas seleções passam a salvar imagem_url de cada joia.
- Relatório do admin tenta foto nesta ordem:
  1. imagem salva na própria seleção
  2. produto com mesmo código
  3. produto com mesmo nome
- Miniaturas da lista de seleções usam o mesmo fallback.
- Isso também recupera a foto de muitas seleções antigas mesmo se o código do produto mudou.

Não altere index.html ou style.css.
