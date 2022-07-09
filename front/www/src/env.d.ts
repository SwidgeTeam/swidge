/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
    readonly VITE_APP_API_HOST: string
    readonly VITE_APP_RPC_NODE_POLYGON: string
    readonly VITE_APP_RPC_NODE_FANTOM: string
    readonly VITE_APP_RPC_NODE_BSC: string
    readonly VITE_APP_RPC_NODE_AVALANCHE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
