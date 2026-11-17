# PALAVRAS+ — VERSÃO 4.0 LOCAL (SEM FIREBASE)

## Abrir
Abra `index.html` no Chrome ou Edge. Não precisa instalar Node.js, acessar Firebase, usar GitHub nem internet para a interface e o CSV.

**Senha simples do moderador: 0510.** É somente uma trava visual, não segurança real.

## Recursos
- Tela de abertura com upload DOCX/CSV e JPG/PNG horizontal 16:9.
- Configuração de nome, categoria, pergunta norteadora, orientações, até 3 palavras, aprovação e cor.
- Prévia antes de aplicar e salvamento local.
- Participação, pendentes, aprovação, exclusão, publicação automática, métricas, nuvem e tela cheia.
- Modelos CSV e DOCX na pasta `modelos`.

## Como funciona sem banco de dados
Tudo fica apenas no armazenamento local (`localStorage`) do navegador. As abas do MESMO navegador/perfil recebem atualizações. Celulares e computadores diferentes NÃO compartilham respostas, mesmo que o site esteja hospedado. Trocar de navegador ou limpar os dados pode apagar as contribuições. Faça testes antes de usar.

**DOCX:** o importador carrega Mammoth.js de uma CDN na primeira importação, portanto essa função requer conexão com a internet. CSV funciona sem internet.

**Imagem:** JPG/PNG 16:9, idealmente 1920 × 1080. O arquivo é reduzido para economizar armazenamento local.

## Publicação futura
Os arquivos não contêm Firebase nem configurações de banco de dados. Quando escolher o novo serviço, basta integrar uma camada de sincronização ao JavaScript, mantendo o layout e os modelos.

Se quiser publicar esta interface no Firebase Hosting já existente (APENAS para disponibilizar as telas, não para usar o banco): copie os arquivos desta pasta para a pasta `public` de seu projeto de Hosting e execute `firebase deploy --only hosting --project palavras-engajamento`. Não use `--only database`. Isso NÃO faz sincronização entre dispositivos.

## Segurança
Não use a senha 0510 como mecanismo de segurança real em um site público: ela está no JavaScript e pode ser inspecionada. Para moderação online, será necessário controle de autorização no novo servidor.
