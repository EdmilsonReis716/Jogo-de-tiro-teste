# Multiplayer Shooter (Minimal)

Repositório minimal para um jogo de tiro multiplayer usando Node.js + WebSocket.

## Como rodar localmente
1. Instale o Node.js (v16+).
2. No diretório do projeto:
   ```bash
   npm install
   npm start
   ```
3. Abra `http://localhost:3000` no navegador em várias abas/janelas para testar multiplayer.

## Sobre hospedagem no GitHub
- **GitHub Pages** só serve sites estáticos — não suporta WebSocket/Node.
- Para rodar o servidor (Node + WebSocket) na nuvem a partir deste repositório, use provedores gratuitos/low-cost que suportem Node (por exemplo, Railway, Render, Fly, Heroku). Também é possível usar um VPS.
- Para hospedar apenas a parte cliente (HTML/JS) no GitHub Pages e usar um servidor WebSocket em outro lugar, faça deploy do servidor separadamente e ajuste `ws` URL no cliente.

## Estrutura
- `server.js` - servidor Node que serve arquivos em `public/` e gerencia conexões WebSocket.
- `public/` - cliente (HTML + JS).
- `package.json` - dependências e script `start`.

## Licença
MIT — modifique como desejar.
