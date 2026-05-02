package com.enicar.projet.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("SERVICE_STAGE")
@Data
public class ServiceStage extends Utilisateur{
}
