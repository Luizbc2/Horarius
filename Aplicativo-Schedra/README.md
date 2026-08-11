# Aplicativo Schedra

Aplicativo mobile do Schedra, desenvolvido com Expo, React Native e TypeScript.

## Executar no celular

1. Copie `.env.example` para `.env`.
2. Troque o IP de exemplo pelo IPv4 do computador na rede local.
3. Instale o Expo Go no celular.
4. Execute `npm start` e leia o QR Code.

O computador e o celular devem estar na mesma rede. Como alternativa, execute `npm run start:tunnel`.

## Estrutura

- `src/features`: funcionalidades organizadas por domínio.
- `src/navigation`: composição das rotas.
- `src/shared`: componentes e infraestrutura reutilizáveis.
- `src/theme`: identidade visual, fontes e temas.
