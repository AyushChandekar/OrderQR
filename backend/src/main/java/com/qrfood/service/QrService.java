package com.qrfood.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class QrService {

    @Value("${frontend.url}")
    private String frontendUrl;

    /** Generate QR using table database ID (globally unique). */
    public byte[] generateQrCode(Long tableId) throws WriterException, IOException {
        String url = frontendUrl + "/menu/" + tableId;

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(url, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);

        return out.toByteArray();
    }
}
