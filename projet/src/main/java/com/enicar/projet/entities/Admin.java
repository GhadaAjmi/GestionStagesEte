package com.enicar.projet.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("ADMIN")
@Data
public class Admin  extends Utilisateur {

}
