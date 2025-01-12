package com.laszlojanku.fitbuddy.jpa.service.crud;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.laszlojanku.fitbuddy.dto.AppUserDto;
import com.laszlojanku.fitbuddy.jpa.entity.AppUser;
import com.laszlojanku.fitbuddy.jpa.repository.AppUserCrudRepository;
import com.laszlojanku.fitbuddy.jpa.service.converter.AppUserConverterService;
import com.laszlojanku.fitbuddy.testhelper.AppUserTestHelper;
import com.laszlojanku.fitbuddy.testhelper.RoleTestHelper;

@ExtendWith(MockitoExtension.class)
class AppUserCrudServiceTest {
	
	@InjectMocks	AppUserCrudService instance;
	@Mock	AppUserCrudRepository appUserCrudRepository;
	@Mock	AppUserConverterService appUserConverterService;
	
	@Test
	void readByName_whenNameIsNull_shouldReturnNull() {
		AppUserDto actualAppUserDto = instance.readByName(null);
		
		assertNull(actualAppUserDto);		
	}
	
	@Test
	void readByName_whenAppUserNotFound_shouldReturnNull() {
		when(appUserCrudRepository.findByName(anyString())).thenReturn(Optional.empty());
		
		AppUserDto actualAppUserDto = instance.readByName("name");
		
		assertNull(actualAppUserDto);
	}
	
	@Test
	void readByName_whenAppUserFound_shouldReturnAppUserDto() {
		AppUser appUser = AppUserTestHelper.getMockAppUser(1, "name", "password");
		AppUserDto appUserDto = new AppUserDto(1, "name", "password", "roleName");
		
		when(appUserCrudRepository.findByName(anyString())).thenReturn(Optional.of(appUser));
		when(appUserConverterService.convertToDto(any(AppUser.class))).thenReturn(appUserDto);
		
		AppUserDto actualAppUserDto = instance.readByName("name");
		
		assertEquals(appUserDto, actualAppUserDto);
	}	
	
	@Test
	void update_whenIdIsNull_shouldReturnNull() {
		AppUserDto actualAppUserDto = instance.update(null, new AppUserDto(1, "name", "password", "roleName"));
		
		assertNull(actualAppUserDto);
	}
	
	@Test
	void update_whenAppUserDtoIsNull_shouldReturnNull() {
		AppUserDto actualAppUserDto = instance.update(1, null);
		
		assertNull(actualAppUserDto);
	}
	
	@Test
	void update_whenExistingAppUserNotFound_shouldReturnNull() {
		when(appUserCrudRepository.findById(anyInt())).thenReturn(Optional.empty());
		
		AppUserDto actualAppUserDto = instance.update(1, new AppUserDto(1, "name", "password", "roleName"));
		
		assertNull(actualAppUserDto);
	}
	
	@Test
	void update_whenExistingAppUserFound_shouldReturnTheUpdatedAppUserDto() {
		AppUser appUser = AppUserTestHelper.getMockAppUser(1, "name", "password", RoleTestHelper.getMockRole(1, "roleName"));		
		AppUserDto appUserDto = new AppUserDto(1, "name", "password", "roleName");
		
		when(appUserCrudRepository.findById(anyInt())).thenReturn(Optional.of(appUser));
		when(appUserConverterService.convertToDto(appUser)).thenReturn(appUserDto);
		when(appUserConverterService.convertToEntity(appUserDto)).thenReturn(appUser);
		
		AppUserDto newAppUserDto = new AppUserDto(1, "newName", "newPassword", "newRoleName");		
		AppUserDto actualAppUserDto = instance.update(1, newAppUserDto);
		
		verify(appUserCrudRepository).save(any(AppUser.class));		
		assertEquals(newAppUserDto.getId(), actualAppUserDto.getId());
		assertEquals(newAppUserDto.getName(), actualAppUserDto.getName());
		assertEquals(newAppUserDto.getPassword(), actualAppUserDto.getPassword());
		assertEquals(newAppUserDto.getRolename(), actualAppUserDto.getRolename());
	}	

}
