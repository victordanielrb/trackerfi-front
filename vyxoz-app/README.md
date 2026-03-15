# TrackerFi Frontend

App mobile do TrackerFi — rastreamento de portfolio crypto.

**Stack:** React Native, Expo, TypeScript

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Rode o app:

```bash
npx expo start
```

3. Escaneie o QR code com o Expo Go (celular) ou pressione `a` para abrir no emulador Android.

## Estrutura

```
app/              # Telas (file-based routing)
components/       # Componentes reutilizaveis
hooks/            # Custom hooks
styles/           # Estilos por pagina/componente
services/         # Chamadas a API do backend
contexts/         # Contexts (auth, tema, etc.)
```
