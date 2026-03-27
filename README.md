# ImWatchingYou 📱

Um aplicativo móvel desenvolvido com [Expo](https://expo.dev) e React Native para *Monitoramento Pervasivo*. O app atua como um nó sensor que coleta dados de bateria e localização GPS do dispositivo Android e os envia via socket TCP para um servidor central em Python.

## 🎯 Objetivo da Atividade

**Atividade 2 – Monitoramento Pervasivo (Android → Servidor Python por Sockets)**

O aplicativo coleta em tempo real:
- **Nível de bateria atual** (%)
- **Coordenadas GPS** (Latitude e Longitude)

Estes dados são enviados via conexão TCP socket para um servidor Python central, permitindo monitoramento pervasivo do dispositivo.

## 🚀 Instalação

1. Clone o repositório:
   ```bash
   git clone <https://github.com/Hermeson69/ImWatchingYou.git>
   cd ImWatchingYou
   ```
   

2. Instale as dependências do app:
   ```bash
   npm install
   ```

## 📱 Como executar o app (Android)

### Usando Expo Go (Recomendado para desenvolvimento rápido)

1. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start
   ```

2. No terminal, pressione `a` para abrir no Android ou escaneie o QR code com o app Expo Go no seu dispositivo Android.


##  Estrutura do Projeto

```
ImWatchingYou/
├── app/                          # Páginas do app (file-based routing)
│   ├── _layout.tsx              # Layout principal do app
│   └── index.tsx                # Página inicial com interface de envio
├── assets/                       # Recursos estáticos
│   └── images/                  # Imagens do app
├── app.json                      # Configurações do Expo
├── package.json                  # Dependências e scripts
├── tsconfig.json                 # Configurações do TypeScript
├── metro.config.js               # Configurações do Metro bundler
├── eslint.config.js              # Configurações do ESLint
└── README.md                     # Este arquivo
```

### Descrição das pastas principais:

- **app/** */: Contém as telas/páginas do aplicativo. Usa o sistema de roteamento baseado em arquivos do expo-router.
  - _layout.tsx: Define o layout global do app (navegação, headers, etc.)
  - index.tsx: Página inicial com campos para IP/Porta e botão de envio

- **assets/** */: Armazena imagens, ícones e outros recursos estáticos do app.


## 🔧 Interface do App

![alt text](assets/images/apkImWatchingYou.jpg)

