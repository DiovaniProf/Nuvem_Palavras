# Nuvem de Palavras • Grupo de Educadores (GE)

Reprodução funcional inspirada nas capturas de tela fornecidas. Feita com HTML, CSS e JavaScript (não Java).

## Arquivos
- `index.html`: estrutura das telas.
- `style.css`: identidade visual e responsividade.
- `app.js`: envio, moderação, métricas e nuvem de palavras.
- `config.js`: configuração opcional da sincronização Firebase.

## Teste local
Abra `index.html` no navegador. O PIN demonstrativo do moderador é `2026`. Abra outras abas no mesmo navegador para testar os envios. As alterações são sincronizadas localmente via `localStorage` e `BroadcastChannel`.

**Importante:** sem configurar o Firebase, diferentes computadores/celulares NÃO compartilham palavras.

## Sincronização entre cursistas e moderador
1. Crie um projeto no Firebase Console e registre um aplicativo Web.
2. Crie um banco de dados **Realtime Database** e copie o `databaseURL` e os demais dados de configuração.
3. Cole a configuração no `config.js`, em `window.GE_FIREBASE_CONFIG`.
4. Hospede os arquivos num servidor HTTPS (por exemplo, Firebase Hosting), e compartilhe a URL com os cursistas.
5. Configure autenticação e regras apropriadas de acesso à base antes de usar com público real.

**Segurança:** o PIN 2026 nesta versão é apenas uma barreira de interface, NÃO é autenticação real. Para uso público, é necessário implementar login seguro do moderador e regras de servidor para impedir aprovações e exclusões por usuários não autorizados. A demonstração com Firebase usa operações diretas na base, portanto não deve ser publicada com regras abertas em produção.

## Regras implementadas
- Uma palavra por envio, sem espaços, até 36 caracteres.
- Moderação manual (padrão) e autoaprovação opcional.
- Métricas de recebidas, pendentes e publicadas.
- Nuvem com palavras únicas e tamanho proporcional à frequência.
- Botões de aprovação, exclusão, fim/reabertura de envios, nova rodada, tela cheia e compartilhamento.
- Interface responsiva em português.
