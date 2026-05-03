package com.enicar.projet.dtos;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentResponseDTO {

    private Long id;

    private String nomFichier;

    private String type;

    private String urlTelechargement;
}