import { Controller, Get , Post, Put, Delete, Param , Body , UseGuards, Headers } from '@nestjs/common';
 import { JobDto } from "../DTO/JobDto";
 import { Job } from '../entities/job.entity';
 import { JobService } from '../services/job.service'


@Controller('api/jobs')
export class JobController {

// dependency injection
constructor (private readonly JobsService : JobService){}

    // get all the jobs
    @Get()
    getall() : Promise<Job[]> {
        return this.JobsService.getall();
    }


    // get a single jobs
    @Get('/:id')
    getOne( @Param('id') id):Promise<Job> {
        return this.JobsService.getOne(id);
    }

    // add jobs

    @Post()
    add(@Body() body : JobDto , @Headers() headers): Promise<Job> {

    console.log(headers);
        return this.JobsService.add(body);
    }


    //update jobs
    @Put(':id')
    update(@Body() body : JobDto, @Param('id') id ) : Promise<void> {
        return this.JobsService.update(body,id);

    } 

    //delete a jobs
    @Delete(':id')
    remove(@Param() param) : Promise<void> {
        return this.JobsService.remove(param.id);
    }
}