# Como adicionar o logo ao projeto

## Local onde colocar o arquivo

O componente `Logo.tsx` está configurado para buscar o arquivo do logo em:

```
public/assets/logo.png
```

## Instruções

1. **Salve o brasão de São Luís** na pasta `public/assets/` com o nome `logo.png`
   - Você pode usar a imagem que já foi anexada (o brasão com os 7 aros)
   - Se quiser converter para SVG, pode usar uma ferramenta online como [Convertio](https://convertio.co/pt/) ou [Online-Convert](https://image.online-convert.com/pt/)

2. **Formatos suportados**:
   - `.png` (recomendado - é o que o componente busca)
   - `.jpg` / `.jpeg`
   - `.svg`

## Arquivos que usam o logo

O logo será exibido automaticamente em:

- ✅ Página de Login (`/auth/login`)
- ✅ Criar Conta (`/auth/criar-conta`)
- ✅ Recuperar Senha (`/auth/recuperar-senha`)
- ✅ Redefinir Senha (`/auth/redefinir-senha`)
- ✅ Sidebar do Dashboard (no topo)

## Customização

O arquivo `src/app/components/Logo.tsx` pode ser customizado. Atualmente suporta 3 tamanhos:
- `small`: 40x40px (usada na sidebar)
- `medium`: 64x64px (usada nas páginas de auth)
- `large`: 96x96px (disponível para uso futuro)

E 2 variantes:
- `icon-only`: apenas o logo
- `with-text`: logo + título e subtítulo (usada na sidebar)

## Próximos passos

1. Salve a imagem do brasão em `public/assets/logo.png`
2. Faça commit:
```bash
git add public/assets/logo.png
git commit -m "Add São Luís coat of arms logo"
git push
```

O logo aparecerá automaticamente em todas as páginas!
