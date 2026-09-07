import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { MenuItemsService } from './menu-items.service';

@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.menuItemsService.findAll(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id/availability')
  updateAvailability(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.menuItemsService.updateAvailability(id, dto.isAvailable);
  }
}
