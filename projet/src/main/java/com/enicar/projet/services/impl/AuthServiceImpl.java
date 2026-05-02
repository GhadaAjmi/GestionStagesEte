 package com.enicar.projet.services.impl;


import com.enicar.projet.dtos.LoginRequest;
import com.enicar.projet.dtos.LoginResponse;
import com.enicar.projet.entities.Utilisateur;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.security.JwtService;
import com.enicar.projet.services.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {

        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token);
    }

}