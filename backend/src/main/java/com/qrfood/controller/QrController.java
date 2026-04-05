package com.qrfood.controller;

import com.qrfood.service.QrService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    /** Generate QR code using table database ID (globally unique). */
    @GetMapping(value = "/{tableId}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrCode(@PathVariable Long tableId) {
        try {
            byte[] qrImage = qrService.generateQrCode(tableId);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrImage);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
