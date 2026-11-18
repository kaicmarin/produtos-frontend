package com.seufrontend.produtosfrontend.controller;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Encaminha as requisições do frontend (porta 8080) para a API (porta 8081).
 * Mantém o JavaScript com rotas relativas (/produtos) e evita problemas de CORS.
 */
@RestController
@RequestMapping("/produtos")
public class ProdutosProxyController {

    private final String backendUrl;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public ProdutosProxyController(@Value("${backend.api.base-url}") String backendUrl) {
        this.backendUrl = backendUrl.replaceAll("/+$", "");
    }

    @GetMapping
    public ResponseEntity<String> listar() {
        return encaminhar("GET", "", null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> consultar(@PathVariable Long id) {
        return encaminhar("GET", "/" + id, null);
    }

    @PostMapping
    public ResponseEntity<String> criar(@RequestBody String produto) {
        return encaminhar("POST", "", produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> atualizar(@PathVariable Long id, @RequestBody String produto) {
        return encaminhar("PUT", "/" + id, produto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> excluir(@PathVariable Long id) {
        return encaminhar("DELETE", "/" + id, null);
    }

    private ResponseEntity<String> encaminhar(String metodo, String caminho, String corpo) {
        try {
            HttpRequest.Builder requisicao = HttpRequest.newBuilder()
                    .uri(URI.create(backendUrl + caminho))
                    .timeout(Duration.ofSeconds(15))
                    .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);

            if (corpo == null) {
                requisicao.method(metodo, HttpRequest.BodyPublishers.noBody());
            } else {
                requisicao.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .method(metodo, HttpRequest.BodyPublishers.ofString(corpo));
            }

            HttpResponse<String> resposta = httpClient.send(requisicao.build(), HttpResponse.BodyHandlers.ofString());
            return ResponseEntity.status(resposta.statusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(resposta.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("{\"erro\":\"Conexão interrompida ao consultar a API\"}");
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("{\"erro\":\"Não foi possível conectar à API de produtos\"}");
        }
    }
}
