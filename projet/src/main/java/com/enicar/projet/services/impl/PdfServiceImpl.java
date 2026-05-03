package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.ConventionRequestDTO;
import com.enicar.projet.dtos.LettreRequestDTO;
import com.enicar.projet.entities.*;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.EntrepriseRepository;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;

import com.enicar.projet.repositories.DemandeStageRepository;
import com.enicar.projet.repositories.DocumentRepository;

import com.enicar.projet.services.interfaces.PdfService;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfServiceImpl implements PdfService {

    private final DocumentRepository  documentDemandeRepository;
    private final DemandeStageRepository demandeStageRepo;
    private final EntrepriseRepository entrepriseRepository;


    // ================================================================
    // LETTRE D'AFFECTATION — public API
    // ================================================================

    /** Génère la lettre SANS signature et la sauvegarde en base. */
    @Override
    public Document generateLettre(Long demandeStageId, LettreRequestDTO dto) throws Exception {
        byte[] pdfBytes = buildLettre(dto);
        return saveDocument(pdfBytes, TypeDocument.LETTRE_AFFECTATION,
                "lettre_affectation.pdf", demandeStageId);
    }
    @Override
    public Document generateAvenant(Long demandeStageId) throws Exception {
        byte[] pdfBytes = buildAvenant(demandeStageId);
        return saveDocument(pdfBytes, TypeDocument.PROLONGATION,
                "avenant-prolongation.pdf", demandeStageId);
    }

    /** Signe une lettre existante (récupérée en base) et retourne le PDF signé. */
    @Override
    public byte[] signerLettre(Long documentId) throws Exception {
        Document doc = documentDemandeRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + documentId));

        byte[] pdfSigne = ajouterSignature(doc.getContenu(),0, 1, 390f, 170f, 120f, 60f);

        doc.setContenu(pdfSigne);
        doc.setNomFichier("lettre_affectation_signee.pdf");
        doc.setStatut(StatutDocument.VALIDE);
        doc.setDateDecision(LocalDateTime.now());
        documentDemandeRepository.save(doc);
        return pdfSigne;
    }

    // ================================================================
    // CONVENTION DE STAGE — public API
    // ================================================================

    @Override
    public Document generateConvention(Long demandeStageId, ConventionRequestDTO dto) throws Exception {

        DemandeStage demande = demandeStageRepo.findById(demandeStageId)
                .orElseThrow(() -> new NotFoundException("Demande de stage introuvable : " + demandeStageId));

        Entreprise entreprise = new Entreprise();

        entreprise.setNom(dto.getEntreprise());
        entreprise.setAdresse(dto.getAdresseEntreprise());
        entreprise.setRepresentant(dto.getRepresentantEntreprise());
        entreprise.setEmail(dto.getEmailEntreprise());
        entreprise.setTelephone(dto.getTelephoneEntreprise());
        entreprise.setFax(dto.getFaxEntreprise());

        Entreprise savedEntreprise = entrepriseRepository.save(entreprise);

        demande.setEntreprise(savedEntreprise);

        demandeStageRepo.save(demande);

        byte[] pdfBytes = buildConvention(dto);

        return saveDocument(
                pdfBytes,
                TypeDocument.CONVENTION,
                "convention-stage.pdf",
                demandeStageId
        );
    }
    /** Signe une convention existante (récupérée en base) et retourne le PDF signé. */
    @Override
    public byte[] signerConvention(Long documentId) throws Exception {
        Document doc = documentDemandeRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + documentId));

        byte[] pdfSigne = ajouterSignature(doc.getContenu(),1, 1, 390f, 80f, 120f, 60f);

        doc.setContenu(pdfSigne);
        doc.setNomFichier("convention_signee.pdf");
        doc.setStatut(StatutDocument.VALIDE);
        doc.setDateDecision(LocalDateTime.now());
        documentDemandeRepository.save(doc);
        return pdfSigne;
    }
    /** Signe une convention existante (récupérée en base) et retourne le PDF signé. */
    @Override
    public byte[] signerProlongation(Long documentId) throws Exception {
        Document doc = documentDemandeRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + documentId));

        byte[] pdfSigne = ajouterSignature(doc.getContenu(), 2,1, 390f, 80f, 120f, 60f);

        doc.setContenu(pdfSigne);
        doc.setNomFichier("prolongation_signee.pdf");
        doc.setStatut(StatutDocument.VALIDE);
        doc.setDateDecision(LocalDateTime.now());
        documentDemandeRepository.save(doc);
        return pdfSigne;
    }


    // ================================================================
    // BUILD INTERNE — LETTRE  (canvas / coordonnées absolues)
    // ================================================================

    private byte[] buildLettre(LettreRequestDTO dto) throws Exception {
        byte[] templateBytes = loadTemplate("lettre-affectation.pdf");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(
                new PdfReader(new java.io.ByteArrayInputStream(templateBytes)),
                new PdfWriter(baos));

        PdfPage   page   = pdfDoc.getFirstPage();
        PdfCanvas canvas = new PdfCanvas(page);
        PdfFont   font   = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont   fontB  = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        // Nom complet étudiant (prénom + nom)
        writeText(canvas, fontB, 11, dto.getPrenomEtudiant() + " " + dto.getNomEtudiant(), 120, 500);
        // CIN + date + lieu de délivrance
        writeText(canvas, font,  11, dto.getCin(),                100, 470);
        writeText(canvas, font,  11, dto.getDateDelivranceCin(),  270, 470);
        writeText(canvas, font,  11, dto.getLieuDelivranceCin(),  380, 470);
        // Niveau + spécialité
        writeText(canvas, font,  11, dto.getNiveau(),             170, 442);
        writeText(canvas, font,  11, dto.getSpecialite(),         360, 442);
        // Entreprise
        writeText(canvas, fontB, 11, dto.getEntreprise(),         200, 415);
        // Dates de stage
        writeText(canvas, font,  11, dto.getDateDebut(),          100, 385);
        writeText(canvas, font,  11, dto.getDateFin(),            310, 385);
        // Date de signature
        writeText(canvas, font,  10, todayFormatted(),            390, 130);

        pdfDoc.close();
        return baos.toByteArray();
    }

    // ================================================================
    // BUILD INTERNE — CONVENTION  (canvas / coordonnées absolues)
    // ================================================================

    private byte[] buildConvention(ConventionRequestDTO dto) throws Exception {
        byte[] templateBytes = loadTemplate("convention-stage.pdf");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(
                new PdfReader(new java.io.ByteArrayInputStream(templateBytes)),
                new PdfWriter(baos));

        PdfPage   page   = pdfDoc.getFirstPage();
        PdfCanvas canvas = new PdfCanvas(page);
        PdfFont   font   = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont   fontB  = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        // ── Entreprise ──────────────────────────────────────────────
        writeText(canvas, fontB, 10, dto.getEntreprise(),              150, 600);
        writeText(canvas, font,  10, dto.getAdresseEntreprise(),        80, 585);
        writeText(canvas, font,  10, dto.getRepresentantEntreprise(),  110, 575);
        writeText(canvas, font,  10, dto.getTuteurStage(),             320, 575);
        writeText(canvas, font,  10, dto.getEmailEntreprise(),          70, 560);
        writeText(canvas, font,  10, dto.getTelephoneEntreprise(),     270, 560);

        // ── Étudiant ────────────────────────────────────────────────
        writeText(canvas, fontB, 10, dto.getPrenomEtudiant(),  70, 520);
        writeText(canvas, fontB, 10, dto.getNomEtudiant(),    270, 520);
        writeText(canvas, font,  10, dto.getSpecialite(),      70, 479);
        writeText(canvas, font,  10, dto.getCin(),             70, 465);
        writeText(canvas, font,  10, dto.getTelephone(),      240, 465);

        // ── Stage ───────────────────────────────────────────────────
        writeText(canvas, font, 10, dto.getDateDebut(),  60, 440);
        writeText(canvas, font, 10, dto.getDateFin(),   260, 440);
        writeText(canvas, font, 10, todayFormatted(),   390,  80);

        pdfDoc.close();
        return baos.toByteArray();
    }

    // ================================================================
    // SIGNATURE — méthode unifiée (réutilisée par lettre ET convention)
    // ================================================================

    /**
     * Ouvre le PDF binaire fourni, dessine le bloc signature à la position
     * (x, y, width, height) sur la page {@code pageNumber}, et retourne
     * le nouveau PDF en bytes.
     */
    private byte[] ajouterSignature(byte[] pdfOriginal,int type,
                                    int    pageNumber,
                                    float  x, float y,
                                    float  width, float height) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(
                new PdfReader(new java.io.ByteArrayInputStream(pdfOriginal)),
                new PdfWriter(baos));

        drawSignatureBlock(pdfDoc,type, pageNumber, x, y, width, height);

        pdfDoc.close();
        return baos.toByteArray();
    }

    /**
     * Dessine sur le canvas :
     *   "A Tunis, le jj/mm/aaaa"
     *   "Directrice de l'ENICarthage"
     *   "(signature et cachet)"
     *   + image signature.png
     */
    private void drawSignatureBlock(PdfDocument pdfDoc,int type,
                                    int   pageNumber,
                                    float x, float y,
                                    float width, float height) throws Exception {
        PdfPage   page   = pdfDoc.getPage(pageNumber);
        PdfCanvas canvas = new PdfCanvas(page);
        PdfFont   fontN  = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont   fontB  = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        float     lh     = 14f;
if(type==0 ){
//lettre d affectation
    writeTextColor(canvas, fontN, 10f, new DeviceRgb(0, 0, 0),
            todayFormatted(), x+45, y + height + lh * 5);

}

else if (type==1) {
    //convention
    writeTextColor(canvas, fontN, 10f, new DeviceRgb(0, 0, 0),
            todayFormatted(), x+65, y + height + lh * 4);

}else {
//prolongation
    writeTextColor(canvas, fontN, 10f, new DeviceRgb(0, 0, 0),
            todayFormatted(), x+85, y + height + lh * 5);

}

        /*  writeTextColor(canvas, fontB, 10f, new DeviceRgb(0, 0, 0),
                "Directrice de l\u2019ENICarthage",  x, y + height + lh * 2);

        writeTextColor(canvas, fontN,  9f, new DeviceRgb(80, 80, 80),
                "(signature et cachet)",             x, y + height + lh);*/

        // Image de signature
        InputStream imgStream  = new ClassPathResource("static/signature.png").getInputStream();
        byte[]      imageBytes = imgStream.readAllBytes();
        ImageData   imageData  = ImageDataFactory.create(imageBytes);
        canvas.addImageFittedIntoRectangle(imageData,
                new Rectangle(x, y, width, height), false);

        canvas.release();
    }

    // ================================================================
    // SAVE EN BASE
    // ================================================================

    private Document saveDocument(byte[]       contenu,
                                  TypeDocument type,
                                  String       nomFichier,
                                  Long         demandeStageId) {
        DemandeStage demande = demandeStageRepo.findById(demandeStageId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable : " + demandeStageId));

        Document doc = new Document();
        doc.setType(type);
        doc.setNomFichier(nomFichier);
        doc.setContenu(contenu);
        doc.setStatut(StatutDocument.GENERE);
        doc.setDateDepot(LocalDateTime.now());
        doc.setDemandeStage(demande);

        return documentDemandeRepository.save(doc);
    }

    public byte[] buildAvenant(Long demandeId) throws Exception {
        byte[] templateBytes = loadTemplate("avenant-prolongation.pdf");

        DemandeStage demande = demandeStageRepo.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(
                new PdfReader(new java.io.ByteArrayInputStream(templateBytes)),
                new PdfWriter(baos));

        PdfPage   page   = pdfDoc.getFirstPage();
        PdfCanvas canvas = new PdfCanvas(page);
        PdfFont   font   = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont   fontB  = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        float h = page.getPageSize().getHeight();
        System.out.println("Avenant page height: " + h);

        // ── Nom étudiant dans le texte principal ──────────────────────
        if (demande.getEtudiant() != null) {
            writeText(canvas, fontB, 10,
                    demande.getEtudiant().getPrenom() + " " + demande.getEtudiant().getNom(),
                    185, h - 210);

            // Spécialité
            writeText(canvas, font, 10,
                    demande.getEtudiant().getSpecialite() != null
                            ? demande.getEtudiant().getSpecialite() : "",
                    65, h - 223);
        }

        // ── Entreprise ────────────────────────────────────────────────
        if (demande.getEntreprise() != null) {
            writeText(canvas, font, 10,
                    demande.getEntreprise().getNom(),
                    55, h - 235);
        }

        // ── Date début ────────────────────────────────────────────────
        if (demande.getDateDebut() != null) {
            writeText(canvas, font, 10,
                    demande.getDateDebut().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    460, h - 235);
        }

        if (demande.getDateFin() != null) {
            writeText(canvas, font, 10,
                    demande.getDateFin().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    80, h - 248);
        }


        // ── Nouvelle date fin (prolongation) — "jusqu'au" ─────────────
        if (demande.getProlongation() != null
                && demande.getProlongation().getDateFinProlongee() != null) {
            writeText(canvas, font, 10,
                    demande.getProlongation().getDateFinProlongee()
                            .format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    90, h - 300);
        }






        pdfDoc.close();
        return baos.toByteArray();
    }
    // ================================================================
    // UTILITAIRES  (portés depuis PdfGenerationService)
    // ================================================================

    /** Charge un template depuis classpath:static/templates/. */
    private byte[] loadTemplate(String filename) throws Exception {
        File file = ResourceUtils.getFile("classpath:static/templates/" + filename);
        return Files.readAllBytes(file.toPath());
    }

    /** Écrit du texte noir à la position (x, y) sur le canvas. */
    private void writeText(PdfCanvas canvas, PdfFont font,
                           float size, String text,
                           float x, float y) throws Exception {
        if (text == null) text = "";
        canvas.beginText()
                .setFontAndSize(font, size)
                .setColor(ColorConstants.BLACK, true)
                .moveText(x, y)
                .showText(text)
                .endText();
    }

    /** Écrit du texte avec une couleur personnalisée à la position (x, y). */
    private void writeTextColor(PdfCanvas canvas, PdfFont font,
                                float size, DeviceRgb color,
                                String text, float x, float y) throws Exception {
        if (text == null) text = "";
        canvas.beginText()
                .setFontAndSize(font, size)
                .setColor(color, true)
                .moveText(x, y)
                .showText(text)
                .endText();
    }

    /** Corrige la rotation d'une page (portraits/paysages mélangés). */
    private void correctRotation(PdfCanvas canvas, PdfPage page) {
        int   rotation = page.getRotation();
        float width    = page.getPageSize().getWidth();
        float height   = page.getPageSize().getHeight();

        switch (rotation) {
            case  90 -> canvas.concatMatrix(0,  1, -1,  0, height,  0);
            case 180 -> canvas.concatMatrix(-1, 0,  0, -1, width,   height);
            case 270 -> canvas.concatMatrix(0, -1,  1,  0, 0,       width);
            default  -> { /* 0° — rien à faire */ }
        }
    }

    /** Tronque un texte à {@code maxLength} caractères. */
    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength
                ? text.substring(0, maxLength) + "..."
                : text;
    }

    /** Retourne la date du jour au format dd/MM/yyyy. */
    private String todayFormatted() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    /** Parse et reformate une date ISO (yyyy-MM-dd) en dd/MM/yyyy. */
    private String formatDate(String date) {
        try {
            return LocalDate.parse(date)
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            return date;
        }
    }

    /** Calcule le nombre de mois entre deux dates ISO. */
    private long calculerMois(String dateDebut, String dateFin) {
        try {
            return java.time.temporal.ChronoUnit.MONTHS.between(
                    LocalDate.parse(dateDebut),
                    LocalDate.parse(dateFin));
        } catch (Exception e) {
            return 0;
        }
    }
}