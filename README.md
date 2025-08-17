**Gerenciador Aulas de Inglês**


Uma aplicação web intuitiva e completa, construída com React, Tailwind CSS e Firebase, projetada para ajudar professores de inglês a organizar e gerenciar suas aulas, rastrear ganhos e agendar compromissos com facilidade.

**Funcionalidades**

Calendário Interativo: Visualização mensal clara para marcar e acompanhar todas as aulas.

Cálculo de Ganhos: Cálculo automático do valor mensal com base nas horas de aula agendadas (R$55/hora).

Aulas Recorrentes: Agendamento de aulas semanais recorrentes em dias específicos.

Gerenciamento de Aulas: Adicione, edite ou exclua aulas facilmente.

Opções de Exclusão: Para aulas recorrentes, escolha entre apagar uma única ocorrência ou a série inteira.

Sincronização em Nuvem: Dados salvos em tempo real no Firebase Firestore.

**Tecnologias Utilizadas**

React – Biblioteca para construção da interface.

Vite – Ferramenta de build rápida e moderna.

Tailwind CSS – Framework CSS utilitário para design responsivo.

Firebase (Firestore & Auth) – Banco de dados em tempo real e autenticação.

**Configuração do Projeto**

Pré-requisitos

Node.js e npm instalados.

Conta no Firebase com projeto configurado.

Passo a Passo

Clone o Repositório

git clone https://github.com/seu-usuario/seu-repositorio.git

cd seu-repositorio


Instale as Dependências

npm install


**Configuração do Firebase**

No console do Firebase, vá em Configurações do Projeto > Geral e copie o objeto de configuração.

Crie um arquivo .env na raiz do projeto e adicione as chaves:

VITE_FIREBASE_API_KEY="SuaChaveAqui"

VITE_FIREBASE_AUTH_DOMAIN="SeuDominioAqui"

VITE_FIREBASE_PROJECT_ID="SeuProjectIdAqui"

VITE_FIREBASE_STORAGE_BUCKET="SeuBucketAqui"

VITE_FIREBASE_MESSAGING_SENDER_ID="SeuSenderIdAqui"

VITE_FIREBASE_APP_ID="SeuAppIdAqui"


Adicione /.env ao .gitignore para evitar expor suas credenciais no GitHub.

**Configuração do Firestore**

No console do Firebase, vá em Firestore Database > Rules.

Publique as seguintes regras:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/classes/{classId} {
      allow read, write: if request.auth != null;
    }
  }
}


Ative também a autenticação Anonymous em Authentication > Sign-in method.

Execute a Aplicação

npm run dev


O app estará disponível em http://localhost:5173.

**Deploy na Web**

Instale o Firebase CLI

npm install -g firebase-tools


Autentique-se e Inicialize o Projeto

firebase login
firebase init


Selecione Hosting.

Escolha o projeto configurado no Firebase.

Use dist como diretório público.

Build e Deploy

npm run build
firebase deploy


Ao final, o link da aplicação será exibido no terminal.


Próximos Passos (Ideias Futuras):

Relatórios financeiros avançados.

Versão mobile otimizada.

Notificações de lembrete de aula.

Criado por Jorge Bernardo
