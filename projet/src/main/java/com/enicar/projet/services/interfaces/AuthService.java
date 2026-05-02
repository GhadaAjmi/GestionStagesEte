package com.enicar.projet.services.interfaces;


import com.enicar.projet.dtos.LoginRequest;
import com.enicar.projet.dtos.LoginResponse;

public interface AuthService {
    public LoginResponse login(LoginRequest request) ;

}
