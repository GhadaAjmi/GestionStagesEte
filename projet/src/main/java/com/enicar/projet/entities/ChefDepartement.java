package com.enicar.projet.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("CHEF_DEPARTEMENT")
@Data
public class ChefDepartement extends Enseignant{
}
