Organizador de Aulas
Uma aplicação web intuitiva e completa, construída com React, Tailwind CSS e Firebase, projetada para ajudar professores de inglês a organizar e gerenciar suas aulas, rastrear ganhos e agendar compromissos com facilidade.

Funcionalidades
Calendário Interativo: Uma visualização mensal clara para marcar e acompanhar todas as aulas.

Cálculo de Ganhos: Calcula automaticamente o valor mensal total com base nas horas de aula agendadas, usando uma taxa fixa de R$55 por hora.

Aulas Recorrentes: Agende aulas que se repetem semanalmente em dias específicos da semana, economizando tempo no agendamento.

Gerenciamento de Aulas: Adicione, edite ou exclua aulas com apenas alguns cliques no calendário.

Opções de Exclusão: Para aulas recorrentes, escolha se deseja apagar apenas uma ocorrência ou a série inteira.

Sincronização em Nuvem: Todos os dados são salvos em tempo real no Firebase Firestore, permitindo que você e sua namorada acessem as informações de qualquer dispositivo.

Acesso Compartilhado: Compartilhe o ID de usuário do perfil com sua namorada para que ela possa visualizar e gerenciar as aulas de qualquer lugar, mesmo sem um sistema de login tradicional.

Tecnologias Utilizadas
React: Biblioteca JavaScript para construir a interface de usuário.

Vite: Ferramenta de build moderna e rápida.

Tailwind CSS: Framework de CSS utilitário para design responsivo e elegante.

Firebase: Plataforma do Google para o banco de dados em tempo real (Firestore) e autenticação.

Como Configurar e Executar o Projeto Localmente
Pré-requisitos
Node.js e npm instalados.

Uma conta no Firebase com um projeto configurado.

Configuração do Projeto
Clone o Repositório:

git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

Instale as Dependências:

npm install

Isso instalará todas as dependências, incluindo React e Tailwind CSS.

Configuração do Firebase:

Vá para o console do Firebase, selecione seu projeto, e vá para Project Settings > General para encontrar o objeto de configuração do seu projeto.

Crie um arquivo chamado .env na raiz do seu projeto e adicione as suas chaves no seguinte formato:

VITE_FIREBASE_API_KEY="SuaChaveAqui"

VITE_FIREBASE_AUTH_DOMAIN="SeuDominioAqui"

VITE_FIREBASE_PROJECT_ID="SeuProjectIdAqui"

VITE_FIREBASE_STORAGE_BUCKET="SeuBucketAqui"

VITE_FIREBASE_MESSAGING_SENDER_ID="SeuSenderIdAqui"

VITE_FIREBASE_APP_ID="SeuAppIdAqui"

Importante: Adicione /.env ao seu arquivo .gitignore para garantir que as suas chaves não sejam publicadas no GitHub.

Configuração do Banco de Dados (Firestore):

No console do Firebase, vá para Firestore Database > Rules.

Publique as seguintes regras para permitir que usuários anônimos e autenticados leiam e escrevam dados:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/classes/{classId} {
      allow read, write: if request.auth != null;
    }
  }
}

Lembre-se de ir na seção Authentication e habilitar o provedor de Anonymous (Anônimo).

Execute a Aplicação:

npm run dev

O aplicativo estará disponível em http://localhost:5173.

Como Fazer o Deploy para a Web
Instale o Firebase CLI (se ainda não o fez):

npm install -g firebase-tools

Autentique-se e Inicialize o Projeto:

firebase login
firebase init

Siga as instruções, selecionando Hosting, seu projeto e use dist como diretório público.

Gere os Arquivos de Produção e Faça o Deploy:

npm run build
firebase deploy

O link para a sua aplicação será exibido no final do processo de deploy.

Como Usar o Recurso de Compartilhamento
Para Acessar seu Próprio Perfil: O ID de usuário do seu perfil atual é exibido na tela, na seção de ganhos.

Para Acessar Outro Perfil: Copie o ID de usuário de outro dispositivo, cole-o no campo "Compartilhar Aulas" e clique em "Carregar". As aulas daquele perfil serão carregadas.
