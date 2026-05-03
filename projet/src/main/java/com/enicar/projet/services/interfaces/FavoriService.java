package com.enicar.projet.services.interfaces;

import java.util.List;


public interface FavoriService {

    boolean toggleFavori(Long utilisateurId, Long travailId);

    List<Long> getMesFavorisIds(Long utilisateurId);
}