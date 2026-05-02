package com.enicar.projet.dtos;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String ancienMotDePasse;
    private String nouveauMotDePasse;
    private String confirmationMotDePasse;
}