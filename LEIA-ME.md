# Atividade 16 — Frontend de Produtos (Spring Boot)

Projeto revisado a partir dos slides 373–380 enviados.

## Organização final

```text
produtos-frontend/
├── .mvn/wrapper/
├── mvnw
├── mvnw.cmd
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/seufrontend/produtosfrontend/
    │   │   ├── ProdutosFrontendApplication.java
    │   │   └── controller/
    │   │       ├── HomeController.java
    │   │       └── ProdutosProxyController.java  (integração adicional)
    │   └── resources/
    │       ├── static/
    │       │   ├── index.html
    │       │   ├── style.css
    │       │   └── script.js
    │       ├── templates/
    │       └── application.properties
    └── test/
```

## Configurações conforme os slides

- Frontend Spring Boot **3.2.0**, Java **17** (Java 21 também pode executar a aplicação).
- `server.port=8080` no `application.properties`.
- `HomeController` entrega `/index.html` ao acessar `/`.
- Arquivos HTML, CSS e JS ficam em `src/main/resources/static`.
- `script.js` usa a rota relativa `/produtos`.
- `pom.xml` possui `spring-boot-starter-web`, `thymeleaf` e `test`.

## Importante: dois servidores não podem usar a mesma porta

O material orienta a acessar o **frontend em 8080**. Para que o seu backend CRUD
também rode localmente, execute o backend na **8081**, pois por padrão ele talvez
já use 8080. O proxy no frontend encaminha `/produtos` para `http://localhost:8081/produtos`.

Em PowerShell no Windows:

1. No diretório **do backend CRUD**, rode o backend na porta **8081**:

   ```powershell
   .\mvnw.cmd spring-boot:run '-Dspring-boot.run.arguments=--server.port=8081'
   ```

   Alternativamente, altere o `server.port` do arquivo `application.properties`
   do backend para 8081 e execute normalmente.

2. Em outro terminal, entre na pasta **produtos-frontend** e execute:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. Abra **http://localhost:8080**.

4. Para gerar o JAR (Windows):

   ```powershell
   .\mvnw.cmd clean package
   ```

## Se o backend usa outra porta ou rota

Troque `backend.api.base-url` em `application.properties`, ou configure a
variável de ambiente `BACKEND_API_BASE_URL` para o endpoint completo.

Exemplo: `http://localhost:8080/api/produtos` (se essas forem as rotas reais).

## Para Render

O endereço `localhost` **não funciona para comunicar serviços separados na
nuvem**. Defina `BACKEND_API_BASE_URL` como a URL pública HTTPS do backend
implantado. O frontend e a API precisam estar acessíveis pelo serviço correspondente.
Configure a porta conforme a plataforma Render, se necessário; o slide usa 8080.

## Diferença intencional em relação ao desenho do slide

Foi incluído `ProdutosProxyController.java` além do `HomeController.java` porque
a atividade mostra o frontend com `fetch('/produtos')`, mas seu backend CRUD
é um projeto separado. Sem esse proxy ou uma configuração equivalente, o
frontend tentaria acessar `/produtos` no servidor errado.

## Verificações

Os arquivos foram inspecionados, o XML analisado e o JavaScript verificado
sintaticamente. A compilação Java e integração com o backend real dependem
de executar Maven e ter a API disponível no computador.
