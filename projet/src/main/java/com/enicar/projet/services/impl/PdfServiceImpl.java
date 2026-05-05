package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.ConventionRequestDTO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.dtos.LettreRequestDTO;
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

import com.enicar.projet.entities.DemandeStage;
import com.enicar.projet.entities.Document;
import com.enicar.projet.entities.Entreprise;
import com.enicar.projet.entities.Journal;
import com.enicar.projet.entities.StatutDocument;
import com.enicar.projet.entities.TypeDocument;
import com.enicar.projet.repositories.DemandeStageRepository;
import com.enicar.projet.repositories.DocumentRepository;
import com.enicar.projet.repositories.EntrepriseRepository;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfServiceImpl implements PdfService {
    private static final Logger log = LogManager.getLogger(PdfServiceImpl.class);

    private final DocumentRepository  documentDemandeRepository;
    private final DemandeStageRepository demandeStageRepo;
    private final EntrepriseRepository entrepriseRepository;

    // ================================================================
    // LETTRE D'AFFECTATION
    // ================================================================


    // ================================================================
    // BUILD INTERNE — LETTRE  (canvas / coordonnées absolues)
    // ================================================================
    @Override
    public byte[] generateLettre(Long demandeStageId, LettreRequestDTO dto) throws Exception {
        log.info("Génération lettre - demandeStageId={}", demandeStageId);

        byte[] templateBytes = loadTemplate("lettre-affectation.pdf");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(
                new PdfReader(new java.io.ByteArrayInputStream(templateBytes)),
                new PdfWriter(baos));
        log.debug("Template lettre chargé avec succès");

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
        log.info("Lettre générée avec succès pour demandeStageId={}", demandeStageId);
        return baos.toByteArray();
    }

    // ================================================================
    // BUILD CONVENTION
    // ================================================================
    @Override
    public byte[] generateConvention(Long demandeStageId, ConventionRequestDTO dto) throws Exception {
        log.info("Génération convention - demandeStageId={}", demandeStageId);
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
        writeText(canvas, font,  10, dto.getFaxEntreprise(),     270, 560);

        // ── Étudiant ────────────────────────────────────────────────
        writeText(canvas, fontB, 10, dto.getPrenomEtudiant(),  70, 520);
        writeText(canvas, fontB, 10, dto.getNomEtudiant(),    270, 520);
        writeText(canvas, font,  10, dto.getSpecialite(),      70, 479);
        writeText(canvas, font,  10, dto.getCin(),             70, 465);
        writeText(canvas, font,  10, dto.getTelephone(),      240, 465);
        writeText(canvas, font, 10, dto.getEmail(), 360, 466);
        // ── Stage ───────────────────────────────────────────────────
        writeText(canvas, font, 10, dto.getDateDebut(),  60, 440);
        writeText(canvas, font, 10, dto.getDateFin(),   260, 440);
        writeText(canvas, font, 10, todayFormatted(),   390,  80);

        pdfDoc.close();
        log.info("Convention générée avec succès");
        return baos.toByteArray();


    }

    // ================================================================
    // Avenant prolongation
    // ================================================================


    @Override
    public byte[] generateAvenant(Long demandeId) throws Exception {
        log.info("Génération avenant - demandeId={}", demandeId);

        byte[] templateBytes = loadTemplate("avenant-prolongation.pdf");

        DemandeStage demande = demandeStageRepo.findById(demandeId)
                .orElseThrow(() -> {
                    log.error("Demande introuvable id={}", demandeId);
                    return new RuntimeException("Demande introuvable");
                });

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
    // Journal
    // ================================================================


    @Override
    public byte[] generateJournal(Long demandeId) throws Exception {
        log.info("Génération journal - demandeId={}", demandeId);
        byte[] templateBytes = loadTemplate("journal-stage.pdf");

        DemandeStage demande = demandeStageRepo.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        List<Journal> entrees = demande.getJournaux();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(
                new PdfReader(new java.io.ByteArrayInputStream(templateBytes)),
                new PdfWriter(baos),
                new StampingProperties().preserveEncryption());

        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // ── Page 1 : Identification ──────────────────────────────────
        PdfPage   page1   = pdfDoc.getPage(1);
        PdfCanvas canvas1 = new PdfCanvas(page1);
        correctRotation(canvas1, page1);

        // Année universitaire
        writeText(canvas1, font, 10,
                demande != null && demande.getDateDemande() != null
                        ? String.valueOf(demande.getDateDemande().getYear())
                        : "",
                620, 757);
        // Nom étudiant
        if (demande.getEtudiant() != null) {
            writeText(canvas1, font, 10,
                    demande.getEtudiant().getPrenom() + " " + demande.getEtudiant().getNom(),
                    650, 732);
            writeText(canvas1, font, 10,
                    demande.getEtudiant().getNumeroInscription() != null
                            ? demande.getEtudiant().getNumeroInscription() : "",
                    620, 705);
            writeText(canvas1, font, 10,
                    demande.getEtudiant().getSpecialite() != null
                            ? demande.getEtudiant().getSpecialite() : "",
                    610, 683);
        }

        // Dates de stage
        if (demande.getDateDebut() != null && demande.getDateFin() != null) {
            writeText(canvas1, font, 10,
                    formatDate(demande.getDateDebut().toString()) +
                            " au " + formatDate(demande.getDateFin().toString()),
                    620, 586);
        }

        // Entreprise
        if (demande.getEntreprise() != null) {
            writeText(canvas1, font, 10,
                    demande.getEntreprise().getNom() != null
                            ? demande.getEntreprise().getNom() : "",
                    620, 561);
            writeText(canvas1, font, 10,
                    demande.getEntreprise().getAdresse() != null
                            ? demande.getEntreprise().getAdresse() : "",
                    620, 513);
            writeText(canvas1, font, 10,
                    demande.getEntreprise().getTelephone() != null
                            ? demande.getEntreprise().getTelephone() : "",
                    580, 410);
        }

        // Tuteur de stage
        writeText(canvas1, font, 10,
                demande.getTuteurStage() != null ? demande.getTuteurStage() : "",
                630, 463);

        // ── Pages journal (page 6 et suivantes) ──────────────────────
        if (!entrees.isEmpty() && pdfDoc.getNumberOfPages() >= 6) {
            int entreeIndex = 0;

            for (int pageNum = 6;
                 pageNum <= pdfDoc.getNumberOfPages() && entreeIndex < entrees.size();
                 pageNum++) {

                PdfPage   pageJournal   = pdfDoc.getPage(pageNum);
                PdfCanvas canvasJournal = new PdfCanvas(pageJournal);
                correctRotation(canvasJournal, pageJournal);

                if (pageNum == 6) {
                    // PAGE 6 : 1 seul tableau à DROITE — 18 lignes
                    float y = 690;
                    for (int i = 0; i < 18 && entreeIndex < entrees.size(); i++) {
                        Journal entree = entrees.get(entreeIndex);
                        writeText(canvasJournal, font, 8,
                                entree.getDate() != null
                                        ? formatDate(entree.getDate().toString()) : "",
                                472, y);
                        writeText(canvasJournal, font, 8,
                                truncate(entree.getActivitesEtObservations(), 35),
                                530, y);
                        y -= 22;
                        entreeIndex++;
                    }
                } else {
                    // PAGES 7+ : 2 tableaux GAUCHE + DROITE — 21 lignes chacun
                    float yGauche = 763;
                    for (int i = 0; i < 21 && entreeIndex < entrees.size(); i++) {
                        Journal entree = entrees.get(entreeIndex);
                        writeText(canvasJournal, font, 8,
                                entree.getDate() != null
                                        ? formatDate(entree.getDate().toString()) : "",
                                52, yGauche);
                        writeText(canvasJournal, font, 8,
                                truncate(entree.getActivitesEtObservations(), 35),
                                120, yGauche);
                        yGauche -= 21;
                        entreeIndex++;
                    }

                    float yDroite = 763;
                    for (int i = 0; i < 21 && entreeIndex < entrees.size(); i++) {
                        Journal entree = entrees.get(entreeIndex);
                        writeText(canvasJournal, font, 8,
                                entree.getDate() != null
                                        ? formatDate(entree.getDate().toString()) : "",
                                472, yDroite);
                        writeText(canvasJournal, font, 8,
                                truncate(entree.getActivitesEtObservations(), 35),
                                530, yDroite);
                        yDroite -= 21;
                        entreeIndex++;
                    }
                }
            }
        }

        pdfDoc.close();
        return baos.toByteArray();
    }


    // ================================================================
    // SIGNATURE
    // ================================================================
    /** Signe une lettre (récupérée en base) et retourne le PDF signé. */

    @Override
    public byte[] signerLettre(Long documentId) throws Exception {
        log.info("Signature lettre documentId={}", documentId);
        Document doc = documentDemandeRepository.findById(documentId)
                .orElseThrow(() ->{
                    log.error("Document introuvable id={}", documentId);
                    return new RuntimeException("Document introuvable : " + documentId);
                });

        byte[] pdfSigne = ajouterSignature(doc.getContenu(),0, 1, 390f, 170f, 120f, 60f);

        doc.setContenu(pdfSigne);
        doc.setNomFichier("lettre_affectation_signee.pdf");
        doc.setStatut(StatutDocument.VALIDE);
        doc.setDateDecision(LocalDateTime.now());
        documentDemandeRepository.save(doc);
        log.info("Lettre signée avec succès documentId={}", documentId);
        return pdfSigne;
    }
    /** Signe une convention (récupérée en base) et retourne le PDF signé. */

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
    /** Signe une prolongation (récupérée en base) et retourne le PDF signé. */
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