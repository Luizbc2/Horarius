# Diretrizes de Desenvolvimento

## Estrutura e Qualidade

- Priorizar layouts responsivos com flexbox e grid.
- Evitar posicionamento absoluto, exceto quando realmente necessario.
- Manter arquivos pequenos e reutilizar componentes.
- Refatorar trechos repetidos para utilitarios ou componentes compartilhados.

## Design System

- Usar tipografia base de 14px quando nao houver especificacao diferente.
- Manter consistencia de espacamento, estados de foco e hierarquia visual.
- Preferir componentes ja existentes em `src/app/components/ui` antes de criar novos.

## Componentes

- Botoes principais devem destacar a acao primaria da tela.
- Botoes secundarios devem apoiar a acao principal sem competir visualmente.
- Labels devem ser curtos, claros e orientados a acao.
