# Como adicionar o logo ao projeto

## Local onde colocar o arquivo

O componente `Logo.tsx` já está configurado para buscar o arquivo do logo em:

```
public/assets/logo.svg
```

## Instruções

1. **Salve o arquivo do logo** (brasão de São Luís) na pasta `public/assets/` com o nome `logo.svg`
   - Se for um arquivo PNG, você pode converter para SVG usando uma ferramenta online como [Convertio](https://convertio.co/pt/) ou [Online-Convert](https://image.online-convert.com/pt/)
   - Ou simplesmente renomeie para `logo.png` e atualize a referência em `Logo.tsx` para `src="/assets/logo.png"`

2. **Formatos suportados**:
   - `.svg` (recomendado - melhor escalabilidade)
   - `.png`
   - `.jpg` / `.jpeg`

## Arquivos que usam o logo

O logo será exibido automaticamente em:

- ✅ Página de Login (`/auth/login`)
- ✅ Criar Conta (`/auth/criar-conta`)
- ✅ Recuperar Senha (`/auth/recuperar-senha`)
- ✅ Redefinir Senha (`/auth/redefinir-senha`)
- ✅ Sidebar do Dashboard (no topo)

## Se precisar ajustar o logo

O arquivo `src/app/components/Logo.tsx` pode ser customizado. Atualmente suporta 3 tamanhos:
- `small`: 40x40px (usada na sidebar)
- `medium`: 64x64px (usada nas páginas de auth)
- `large`: 96x96px (disponível para uso futuro)

E 2 variantes:
- `icon-only`: apenas o logo
- `with-text`: logo + título e subtítulo (usada na sidebar)
