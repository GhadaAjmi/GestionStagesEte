package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@DiscriminatorValue("RESPONSABLE")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Responsable extends Utilisateur {
}
