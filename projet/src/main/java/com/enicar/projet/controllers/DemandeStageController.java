package com.enicar.projet.controllers;

import com.enicar.projet.dtos.DemandeStageDTO;
import com.enicar.projet.services.interfaces.DemandeStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DemandeStageController {

    private final DemandeStageService service;

    @PostMapping
    public DemandeStageDTO save(@RequestBody DemandeStageDTO dto) {
      return service.save(dto);

    }


    @GetMapping
    public List<DemandeStageDTO> all(){
        return service.findAll();
    }

    @GetMapping("etudiant/{id}")
    public DemandeStageDTO getByEtudiant(@PathVariable Long id){
        return service.findByEtudiantId(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }

    @GetMapping("/{id}")
    public DemandeStageDTO getById(@PathVariable Long id){
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public DemandeStageDTO update(@PathVariable Long id, @RequestBody DemandeStageDTO dto){
        return service.update(id, dto);
    }
}
